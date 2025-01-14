const express = require('express');
const db = require('../../config/db');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const fetchStockPrices = async (tickers) => {
    try {
        const response = await axios.get(`http://localhost:3001/stocks`, {
            params: { tickers: tickers.join(',') },
        });

        return response.data.reduce((acc, stock) => {
            if (stock.data && stock.data.length > 0) {
                acc[stock.symbol] = stock.data[stock.data.length - 1].c || 0;
            } else {
                console.warn(`No data available for ticker: ${stock.symbol}`);
                acc[stock.symbol] = 0;
            }
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching stock prices:', error.response?.data || error.message);
        return {};
    }
};

router.post('/sell', async (req, res) => {
    const { user_id, ticker, amount, price_per_share } = req.body;

    if (!user_id || !ticker || !amount || !price_per_share) {
        return res.status(400).send({ error: 'Missing required fields.' });
    }

    try {
        const sellAmount = parseFloat(amount);

        // Fetch user's completed purchase transactions with remaining amounts, ordered by oldest first
        const [transactions] = await db.promise().query(
            `SELECT id, amount_remained, price_per_share 
             FROM transactions 
             WHERE user_id = ? AND ticker = ? AND payment_status = 'completed' AND amount_remained > 0
             ORDER BY created_at ASC`,
            [user_id, ticker]
        );

        if (!transactions.length) {
            return res.status(400).send({ error: 'No shares available to sell.' });
        }

        let remainingSellAmount = sellAmount;
        let totalSaleValue = 0;
        let totalCostBasis = 0;

        // FIFO logic: Deduct sold shares from `amount_remained` in oldest transactions
        for (const transaction of transactions) {
            if (remainingSellAmount <= 0) break;

            const availableAmount = parseFloat(transaction.amount_remained);
            const amountToSell = Math.min(availableAmount, remainingSellAmount);

            remainingSellAmount -= amountToSell;
            totalSaleValue += amountToSell * price_per_share;
            totalCostBasis += amountToSell * transaction.price_per_share;

            // Update the transaction's `amount_remained`
            await db.promise().query(
                `UPDATE transactions SET amount_remained = amount_remained - ? WHERE id = ?`,
                [amountToSell, transaction.id]
            );
        }

        if (remainingSellAmount > 0) {
            return res.status(400).send({ error: 'Insufficient shares to sell.' });
        }

        const gainLoss = totalSaleValue - totalCostBasis;

        // Record the sale in the `transactions_sold` table
        await db.promise().query(
            `INSERT INTO transactions_sold (user_id, ticker, amount, price_per_share, total_price, gain_loss)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, ticker, sellAmount, price_per_share, totalSaleValue, gainLoss]
        );

        res.status(200).send({
            message: 'Shares sold successfully!',
            gainLoss: gainLoss.toFixed(2),
            gainLossPercentage: ((gainLoss / totalCostBasis) * 100).toFixed(2),
        });
    } catch (error) {
        console.error('Error processing sale:', error.message);
        res.status(500).send({ error: 'Failed to process sale.' });
    }
});

router.get('/my-shares/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(401).send({ error: 'User not logged in.' });
    }

    try {
        // Fetch completed transactions for the user
        const [transactions] = await db.promise().query(
            `SELECT ticker, amount_remained, price_per_share 
             FROM transactions 
             WHERE user_id = ? AND payment_status = 'completed' AND amount_remained > 0`,
            [userId]
        );

        if (transactions.length === 0) {
            return res.status(200).send({ message: 'No shares found.', shares: [] });
        }

        // Fetch sold shares for the user
        const [sales] = await db.promise().query(
            `SELECT ticker, SUM(amount) AS total_sold 
             FROM transactions_sold 
             WHERE user_id = ? 
             GROUP BY ticker`,
            [userId]
        );

        const salesMap = sales.reduce((acc, sale) => {
            acc[sale.ticker] = parseFloat(sale.total_sold || 0);
            return acc;
        }, {});

        // Group transactions by ticker
        const groupedTransactions = transactions.reduce((acc, tx) => {
            if (!acc[tx.ticker]) {
                acc[tx.ticker] = [];
            }
            acc[tx.ticker].push(tx);
            return acc;
        }, {});

        // Fetch current prices for all tickers
        const tickers = Object.keys(groupedTransactions);
        const stockPrices = await fetchStockPrices(tickers);

        const exchangeRateResponse = await axios.get('http://localhost:3001/shares-management/get-pln-exchange-rate');
        const plnExchangeRate = exchangeRateResponse.data.exchangeRate;

        // Calculate share details
        const shares = tickers.map((ticker) => {
            const transactions = groupedTransactions[ticker];
            const currentPrice = stockPrices[ticker] || 0;
            const currentPlnPrice = currentPrice * plnExchangeRate;

            const totalQuantity = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount_remained), 0);
            const totalCost = transactions.reduce((sum, tx) => sum + tx.amount_remained * tx.price_per_share, 0);
            const avgPrice = totalCost / totalQuantity;

            const soldQuantity = salesMap[ticker] || 0;
            const remainingQuantity = totalQuantity;

            const currentValue = parseFloat(remainingQuantity) * parseFloat(currentPlnPrice);
            const gainLoss = currentValue - (remainingQuantity * avgPrice);
            const floatedGainLoss = parseFloat(gainLoss.toFixed(2));
            const floatedCurrentValue = parseFloat(currentValue.toFixed(2));
            const currentValueWithMarketCorrection = floatedGainLoss + floatedCurrentValue;

            return {
                ticker,
                totalQuantity: totalQuantity.toFixed(2),
                totalCost: totalCost.toFixed(2),
                soldQuantity: soldQuantity.toFixed(2),
                remainingQuantity: remainingQuantity.toFixed(2),
                avgPrice: avgPrice.toFixed(2),
                currentPrice: currentPlnPrice.toFixed(2),
                currentValue: currentValue.toFixed(2),
                currentValueWithMarketCorrection: currentValueWithMarketCorrection.toFixed(2),
                gainLoss: gainLoss.toFixed(2),
                gainLossPercentage: remainingQuantity > 0
                    ? ((gainLoss / (remainingQuantity * avgPrice)) * 100).toFixed(2)
                    : '0.00',
            };
        });

        res.status(200).send({ shares });
    } catch (error) {
        console.error('Error fetching shares:', error.message);
        res.status(500).send({ error: 'Failed to fetch shares.' });
    }
});

// Endpoint: Account history
router.get('/account-history', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(401).send({ error: 'User not logged in.' });
    }

    try {
        const [buyTransactions] = await db.promise().query(
            `SELECT ticker, amount, price_per_share, created_at 
             FROM transactions 
             WHERE user_id = ? AND payment_status = 'completed' 
             ORDER BY created_at ASC`,
            [userId]
        );

        const [sellTransactions] = await db.promise().query(
            `SELECT ticker, amount, price_per_share, created_at 
             FROM transactions_sold 
             WHERE user_id = ? 
             ORDER BY created_at ASC`,
            [userId]
        );

        const allTransactions = [
            ...buyTransactions.map(tx => ({ ...tx, type: 'buy' })),
            ...sellTransactions.map(tx => ({ ...tx, type: 'sell' })),
        ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const uniqueTickers = [...new Set(allTransactions.map(tx => tx.ticker))];
        const stockPrices = await fetchStockPrices(uniqueTickers);

        const exchangeRateResponse = await axios.get('http://localhost:3001/shares-management/get-pln-exchange-rate');
        const plnExchangeRate = exchangeRateResponse.data.exchangeRate;

        const tickerHoldings = {};
        const accountHistory = [];
        let totalValue = 0;

        for (const tx of allTransactions) {
            const { ticker, amount, price_per_share, created_at, type } = tx;

            if (!tickerHoldings[ticker]) {
                tickerHoldings[ticker] = 0;
            }

            tickerHoldings[ticker] += type === 'buy' ? parseFloat(amount) : -parseFloat(amount);

            const currentPrice = stockPrices[ticker] || 0;
            const currentPlnPrice = currentPrice * plnExchangeRate;
            
            totalValue = Object.keys(tickerHoldings).reduce((sum, t) => {
                return sum + tickerHoldings[t] * (stockPrices[t] * plnExchangeRate || 0);
            }, 0);

            accountHistory.push({
                date: created_at,
                value: totalValue.toFixed(2),
            });
        }

        res.status(200).send({ history: accountHistory });
    } catch (error) {
        console.error('Error calculating account history:', error.message);
        res.status(500).send({ error: 'Failed to calculate account history.' });
    }
});

router.get('/get-pln-exchange-rate', async (req, res) => {
    try {
        const response = await axios.get('https://api.freecurrencyapi.com/v1/latest', {
            params: {
                apikey: process.env.CONVERTER_API_KEY, // Use environment variable
                currencies: 'PLN',
            },
        });

        const exchangeRate = response.data.data.PLN;

        if (!exchangeRate) {
            return res.status(500).send({ error: 'Failed to fetch exchange rate.' });
        }
        res.status(200).send({ exchangeRate });
    } catch (error) {
        console.error('Error fetching exchange rate:', error.message);
        res.status(500).send({ error: 'Failed to fetch exchange rate.' });
    }
});

module.exports = router;