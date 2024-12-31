import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StockChart from './StockChart';

function Charts() {
  const predefinedTickers = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];
  const [tickers, setTickers] = useState(predefinedTickers); // Current tickers to display charts
  const [tickerOptions, setTickerOptions] = useState([]); // Options for the dropdown
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDisabled, setSearchDisabled] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    fetchTickerOptions();
    fetchStockData(predefinedTickers);
  }, []);

  // Fetch ticker options
  const fetchTickerOptions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tickers');
      setTickerOptions(response.data.map((ticker) => ticker.name));
    } catch (error) {
      console.error('Failed to fetch ticker options:', error);
    }
  };
  
  // Fetch stock data for the selected tickers
  const fetchStockData = async (selectedTickers) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/stocks', {
        params: { tickers: selectedTickers.join(',') },
      });
      setStockData(response.data);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    } finally {
      setLoading(false);
      freezeSearch();
    }
  };

  // Freeze the search bar for 1 minute
  const freezeSearch = () => {
    setSearchDisabled(true);
    setTimer(60); // 60 seconds
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setSearchDisabled(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // Handle ticker selection changes
  const handleTickerChange = (selectedTickers) => {
    if (selectedTickers.length > 5) {
      alert('You can select up to 5 tickers.');
      return;
    }
    setTickers(selectedTickers);
  };

  // Fetch new data when user submits a new selection
  const handleSearchSubmit = () => {
    if (!searchDisabled) {
      fetchStockData(tickers);
    }
  };

  return (
    <div className="charts-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Ticker Selector */}
        <div className="ticker-selector">
          <label htmlFor="tickerSelect" className="form-label">Select Tickers:</label>
          <select
            id="tickerSelect"
            className="form-select"
            multiple
            value={tickers}
            onChange={(e) =>
              handleTickerChange([...e.target.selectedOptions].map((option) => option.value))
            }
            disabled={searchDisabled}
          >
            {tickerOptions.map((ticker) => (
              <option key={ticker} value={ticker}>
                {ticker}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          className="btn btn-primary"
          onClick={handleSearchSubmit}
          disabled={searchDisabled}
        >
          {searchDisabled ? `Search Disabled (${timer}s)` : 'Search'}
        </button>
      </div>

      {/* Charts */}
      {loading ? (
        <p>Loading stock data...</p>
      ) : (
        <StockChart stockData={stockData} />
      )}
    </div>
  );
}

export default Charts;
