import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MyShares = () => {
    const userId = Number(sessionStorage.getItem('user_id'));
    const [shares, setShares] = useState([]);
    const [accountHistory, setAccountHistory] = useState([]);
    const [exchangeRate, setExchangeRate] = useState(1); // Default exchange rate to 1
    const [loading, setLoading] = useState(true);
    const [sellAmount, setSellAmount] = useState('');
    const [sellTicker, setSellTicker] = useState('');

    // Fetch shares and account history
    const fetchSharesAndHistory = async () => {
        try {
            const sharesResponse = await axios.get(`http://localhost:3001/shares-management/my-shares/${userId}`);
            setShares(sharesResponse.data.shares);

            const historyResponse = await axios.get(`http://localhost:3001/shares-management/account-history`, {
                params: { userId },
            });
            setAccountHistory(historyResponse.data.history);
        } catch (error) {
            console.error('Error fetching shares or history:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchExchangeRate = async () => {
        try {
          const response = await axios.get('http://localhost:3001/shares-management/get-pln-exchange-rate');
          setExchangeRate(response.data.exchangeRate); // Update the exchange rate
        } catch (error) {
          console.error('Error fetching exchange rate:', error);
        }
      };

    useEffect(() => {
        fetchSharesAndHistory();
        fetchExchangeRate();
    }, []);

    // Handle selling shares
    const handleSellShares = async (ticker, currentPrice) => {
        try {
            const response = await axios.post('http://localhost:3001/shares-management/sell', {
                user_id: userId,
                ticker,
                amount: parseFloat(sellAmount),
                price_per_share: currentPrice,
            });

            alert(response.data.message);
            setSellAmount('');
            setSellTicker('');
            fetchSharesAndHistory(); // Refresh shares and history after selling
        } catch (error) {
            console.error('Error selling shares:', error.response?.data || error.message);
            alert('Failed to sell shares.');
        }
    };

    const totalValueOfShares = shares.reduce((total, share) => total + (parseFloat(share.currentValueWithMarketCorrection) || 0), 0).toFixed(2);

    const totalValueOfSharesInUSD = (totalValueOfShares / exchangeRate).toFixed(2);

    const chartData = {
        labels: [...accountHistory.map((entry) => new Date(entry.date).toLocaleDateString()), 'Total Value'],
        datasets: [
            {
                label: 'Account Value Over Time',
                data: [0, ...accountHistory.map((entry) => parseFloat(entry.value)), parseFloat(totalValueOfShares)],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3, // Smooth line for better visuals
            },
        ],
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (shares.length === 0) {
        return <div>You don't own any shares yet.</div>;
    }

    return (
        <div>
            <h1>My Shares</h1>
            <div>
                <h2>Account Value</h2>
                <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: false } } }} />
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Ticker</th>
                        <th>Remaining Quantity</th>
                        <th>Current Price</th>
                        <th>Current Value</th>
                        <th>Gain/Loss</th>
                        <th>Gain/Loss persentage</th>
                        <th>Sell</th>
                    </tr>
                </thead>
                <tbody>
                    {shares.map((share) => (
                        <tr key={share.ticker}>
                            <td className='bold'>{share.ticker}</td>
                            <td>{share.remainingQuantity}</td>
                            <td>${(share.currentPrice / exchangeRate).toFixed(2)}(~{share.currentPrice}PLN)</td>
                            <td>${(share.currentValueWithMarketCorrection / exchangeRate).toFixed(2)}(~{share.currentValueWithMarketCorrection}PLN)</td>
                            <td style={{ color: share.gainLoss >= 0 ? 'green' : 'red', }}>
                                ${share.gainLoss / exchangeRate}(~{share.gainLoss}PLN)
                            </td>
                            <td style={{color: share.gainLossPercentage >= 0 ? 'green' : 'red',}}>%{share.gainLossPercentage}</td>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    value={sellTicker === share.ticker ? sellAmount : ''}
                                    onChange={(e) => {
                                        setSellAmount(e.target.value);
                                        setSellTicker(share.ticker);
                                    }}
                                />
                                <button
                                    onClick={() => handleSellShares(share.ticker, share.currentPrice)}
                                    disabled={!sellAmount || sellTicker !== share.ticker || parseFloat(sellAmount) > share.remainingQuantity}
                                >
                                    Sell
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3>Total value of shares: </h3>
            <h3 style={{ color: totalValueOfShares >= 0 ? 'green' : 'red', }}>${totalValueOfSharesInUSD} (~{totalValueOfShares} PLN)</h3>
        </div>
    );
};

export default MyShares;
