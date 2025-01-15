import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockChart = ({ stockData }) => {
  const location = useLocation();
  const [amounts, setAmounts] = useState({});
  const [transactionMessage, setTransactionMessage] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1); // Default exchange rate to 1
  const [profile, setProfile] = useState({
    name: '',
    surname: '',
    email: '',
    nickname: '',
  });
  const [analysisMessages, setAnalysisMessages] = useState({}); // Store analysis messages for each stock

  useEffect(() => {
    fetchProfile();
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const transactionId = query.get('transactionId');

    if (transactionId) {
      axios.get(`http://localhost:3001/payu/payment-confirmation?transactionId=${transactionId}`)
        .then(response => {
          setTransactionMessage(response.data.message);
        })
        .catch(error => {
          console.error('Error verifying transaction:', error.response?.data || error.message);
          setTransactionMessage('Failed to verify transaction.');
        });
    }
  }, [location.search]);

  // Fetch the profile from the backend
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/profile/${sessionStorage.getItem('user_id')}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch the USD to PLN exchange rate
  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get('http://localhost:3001/shares-management/get-pln-exchange-rate');
      setExchangeRate(response.data.exchangeRate); // Update the exchange rate
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const fetchAnalysis = async (minimizedStockData) => {
    try {
      const response = await axios.post('http://localhost:3001/analysis/analyse', { minimizedStockData });
      const results = response.data.analysisResults;

      const updatedMessages = results.reduce((acc, result) => {
        acc[result.ticker] = result.analysis;
        return acc;
      }, {});

      setAnalysisMessages((prev) => ({ ...prev, ...updatedMessages }));
    } catch (error) {
      console.error('Error fetching analysis:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    // Minimize stock data for analysis and send to the server
    const minimizedStockData = stockData.map((stock) => ({
      symbol: stock.symbol,
      data: stock.data.map((entry) => ({
        t: entry.t, // Timestamp
        c: entry.c, // Closing price
      })),
    }));

    if (minimizedStockData.length > 0) {
      fetchAnalysis(minimizedStockData);
    }
  }, [stockData]);

  const handleBuyShares = async (ticker, pricePerShareUSD) => {
    try {
      const priceInPLN = (pricePerShareUSD * exchangeRate).toFixed(2); // This is a string
      const formattedPriceInPLN = parseFloat(priceInPLN); // Ensure it is a float
      console.log('Buying shares:', ticker, amounts[ticker], priceInPLN, exchangeRate);
      const response = await axios.post('http://localhost:3001/payu/buy', {
        user_id: sessionStorage.getItem('user_id'),
        ticker,
        amount: parseFloat(amounts[ticker] || 0),
        payment_account: profile.email,
        price_per_share: formattedPriceInPLN, // Use converted price in PLN
      });

      alert('Redirecting to payment...');
      window.location.href = response.data.redirect_url;
    } catch (error) {
      console.error('Error buying shares:', error.response?.data || error.message);
      alert('Failed to buy shares.');
    }
  };

  const handleAmountChange = (ticker, value) => {
    setAmounts((prev) => ({
      ...prev,
      [ticker]: value,
    }));
  };

  return (
    <div>
      {stockData.map((stock) => {
        const lastClosePriceUSD = stock.data[stock.data.length - 1]?.c || 0;
        const lastClosePricePLN = (lastClosePriceUSD * exchangeRate).toFixed(2); // Convert to PLN
        const analysis = analysisMessages[stock.symbol] || [];

        const chartData = {
          labels: stock.data.map((item) => new Date(item.t).toLocaleDateString()),
          datasets: [
            {
              label: `${stock.symbol} Close Price`,
              data: stock.data.map((item) => item.c),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
              label: `${stock.symbol} High Price`,
              data: stock.data.map((item) => item.h),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
              label: `${stock.symbol} Low Price`,
              data: stock.data.map((item) => item.l),
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgba(255, 159, 64, 0.5)',
            },
          ],
        };

        return (
          <div key={stock.symbol} className='card p-3 m-3 shadow'>
            <h4>{stock.symbol} Stock Data Chart</h4>
            <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: false } } }} />
            <div className='my-2'>
              <p>Last Close Price: ${lastClosePriceUSD.toFixed(2)} (~{lastClosePricePLN} PLN)</p>
              <div className='row'>
                <div className='col-xl-6 col-sm-9 col-12'>
                  <div className='input-group'>
                    <span class="input-group-text"><i className="bi bi-bar-chart-steps"></i></span>
                    <input
                      type="number"
                      step="0.01"
                      className='form-control'
                      placeholder="Amount of shares"
                      value={amounts[stock.symbol] || ''}
                      onChange={(e) => handleAmountChange(stock.symbol, e.target.value)}
                    />
                    <button
                      className='btn btn-primary'
                      onClick={() => handleBuyShares(stock.symbol, lastClosePriceUSD)}
                      disabled={!amounts[stock.symbol] || lastClosePriceUSD === 0}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h5>Analysis:</h5>
              {analysis.length > 0 ? (
                <div className='row g-0'>
                  {analysis.map((item, index) => (
                    <div key={index} className={`${item.summary.includes('decreased') ? 'text-danger' : item.summary.includes('increased') ? 'text-success' : 'text-dark'} bg-light border col-xl-2 col-sm-5 col-12 m-3 p-2 shadow rounded`}>
                      {item.summary}
                    </div>
                  ))}
                </div>
              ) : (
                <p>Loading analysis...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockChart;
