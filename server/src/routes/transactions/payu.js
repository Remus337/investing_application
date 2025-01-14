const express = require('express');
const db = require('../../config/db');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const PAYU_CLIENT_ID = process.env.PAYU_CLIENT_ID;
const PAYU_CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET;
const PAYU_SANDBOX_URL = 'https://secure.snd.payu.com';
const REDIRECT_URL = 'http://localhost/charts';
const NOTIFY_URL = 'http://localhost:3001/payu/notify';

// Get PayU access token
async function getPayUAccessToken() {
    try {
        const response = await axios.post(`${PAYU_SANDBOX_URL}/pl/standard/user/oauth/authorize`, null, {
            params: {
                grant_type: 'client_credentials',
                client_id: PAYU_CLIENT_ID,
                client_secret: PAYU_CLIENT_SECRET,
            },
        });
        console.log('PayU access token:', response.data);
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting PayU access token:', error);
        throw new Error('Failed to get PayU access token.');
    }
}

// Buy endpoint
router.post('/buy', async (req, res) => {
    const { user_id, ticker, amount, payment_account, price_per_share } = req.body;

    if (!user_id || !ticker || !amount || !payment_account || !price_per_share) {
        return res.status(400).send({ error: 'Missing required fields.' });
    }

    try {
        let SCALE_FACTOR;

        // Determine the appropriate scale factor based on the amount
        if (amount < 0.1) {
            SCALE_FACTOR = 100;
        } else if (amount >= 0.1 && amount < 1) {
            SCALE_FACTOR = 10;
        } else if (amount >= 1 && amount < 10) {
            SCALE_FACTOR = 1;
        } else {
            SCALE_FACTOR = 1;
        }

        // Calculate scaled values
        const scaledAmount = Math.round(amount * SCALE_FACTOR);
        const scaledUnitPrice = Math.round(price_per_share * (100 / SCALE_FACTOR)); // Price in smallest unit
        const totalCost = scaledAmount * scaledUnitPrice;
        
        const transactionIdInternal = Math.random().toString(36).substr(2, 11);

        const accessToken = await getPayUAccessToken();

        // Save transaction as pending
        const [result] = await db.promise().query(
            `INSERT INTO transactions (user_id, transaction_id, ticker, amount, amount_remained, price_per_share, total_price, payment_status, payment_order_id, payment_account)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                transactionIdInternal,
                ticker,
                amount,
                amount,
                price_per_share,
                totalCost / 100,
                'PENDING',
                null,
                payment_account,
            ]
        );
        console.log('Transaction saved:', result);

        const paymentPayload = {
            continueUrl: `${REDIRECT_URL}?transactionId=${transactionIdInternal}`,
            notifyUrl: NOTIFY_URL,
            customerIp: req.ip,
            merchantPosId: process.env.PAYU_MERCHANT_POS_ID,
            description: `Purchase of shares for ${ticker}`,
            currencyCode: 'PLN',
            totalAmount: totalCost.toString(),
            buyer: { email: payment_account },
            products: [
                {
                    name: ticker,
                    unitPrice: scaledUnitPrice.toString(),
                    quantity: scaledAmount.toString(),
                },
            ],
        };

        const paymentResponse = await axios.post(
            `${PAYU_SANDBOX_URL}/api/v2_1/orders`,
            paymentPayload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                maxRedirects: 0, // Prevent axios from following redirects
                validateStatus: (status) => status >= 200 && status < 400, // Allow 302 as a valid response
            }
        );

        // Handle redirect response
        if (paymentResponse.status === 302 || paymentResponse.status === 301) {
            const redirectUrl = paymentResponse.headers.location;
            console.log('Redirect URL:', redirectUrl);

            // Update the transaction with the payment order ID
            await db.promise().query(
                `UPDATE transactions SET payment_order_id = ? WHERE transaction_id = ?`,
                [paymentResponse.data.orderId || null, transactionIdInternal]
            );

            return res.status(200).send({ message: 'Redirect to payment page.', redirect_url: redirectUrl });
        }

        // Handle other valid responses
        const { status, redirectUrl } = paymentResponse.data;

        if (!status || status.statusCode !== 'SUCCESS') {
            console.error('Payment failed:', paymentResponse.data);
            return res.status(400).send({ error: 'Payment failed', details: paymentResponse.data });
        }

        res.status(200).send({ message: 'Shares purchased successfully!', redirect_url: redirectUrl });
    } catch (error) {
        if (error.response && error.response.status === 302) {
            const redirectUrl = error.response.headers.location;
            console.log('Redirect URL:', redirectUrl);
            return res.status(200).send({ message: 'Redirect to payment page.', redirect_url: redirectUrl });
        } else if (error.response) {
            console.error('PayU Error Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error processing transaction:', error.message);
        }
        res.status(500).send({ error: 'Transaction failed: ' + error.message });
    }
});

router.get('/payment-confirmation', async (req, res) => {
    const { transactionId } = req.query;

    if (!transactionId) {
        // No transaction ID; simply render the charts
        return res.status(200).send({ message: 'Charts page loaded without transaction update.' });
    }

    try {
        // Get the transaction details from the database
        const [rows] = await db.promise().query(
            `SELECT * FROM transactions WHERE transaction_id = ? AND payment_status = 'PENDING'`,
            [transactionId]
        );

        if (rows.length === 0) {
            return res.status(400).send({ error: 'Invalid or already completed transaction.' });
        }

        const transaction = rows[0];

        // Verify payment status with PayU
        const accessToken = await getPayUAccessToken();
        const response = await axios.get(
            `${PAYU_SANDBOX_URL}/api/v2_1/orders/${transaction.payment_order_id}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const orderStatus = response.data.status?.statusCode;

        if (orderStatus === 'SUCCESS') {
            await db.promise().query(
                `UPDATE transactions SET payment_status = 'COMPLETED' WHERE transaction_id = ?`,
                [transactionId]
            );

            console.log(`Transaction ${transactionId} marked as COMPLETED`);
            return res.status(200).send({ message: 'Transaction completed successfully.' });
        }

        console.log(`Transaction ${transactionId} not yet completed: ${orderStatus}`);
        return res.status(400).send({ error: 'Transaction not yet completed.' });
    } catch (error) {
        console.error('Error verifying or updating transaction:', error.message);
        res.status(500).send({ error: 'Failed to verify or update transaction.' });
    }
});

module.exports = router;
