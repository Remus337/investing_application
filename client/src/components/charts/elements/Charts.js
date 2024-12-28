import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StockChart from './StockChart';

function Charts() {
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/stocks');
        setStockData(response.data);
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Stock Charts</h2>
      <StockChart stockData={stockData} />
    </div>
  );
}

export default Charts;
