import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
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
      const options = response.data.map(ticker => ({
        label: `${ticker.name} (${ticker.ticker})`, // Display name and ticker in the select
        value: ticker.ticker, // Use ticker for the value
      }));
      setTickerOptions(options);
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
  const handleTickerChange = (selectedOptions) => {
    if (selectedOptions.length > 5) {
      alert('You can select up to 5 tickers.');
      return;
    }
    setTickers(selectedOptions.map(option => option.value)); // Store only the ticker values
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
          <Select
            id="tickerSelect"
            isMulti
            value={tickerOptions.filter(option => tickers.includes(option.value))} // Display selected tickers
            options={tickerOptions}
            onChange={handleTickerChange}
            isDisabled={searchDisabled}
            placeholder="Search and select tickers"
            getOptionLabel={(e) => e.label} // Show the ticker name and symbol
            closeMenuOnSelect={false}
          />
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
