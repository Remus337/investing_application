import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockChart from './components/StockChart';

function App() {
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
    <div className="App">
      <StockChart stockData={stockData} />
    </div>
  );
}

export default App;
