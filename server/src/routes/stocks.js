const axios = require('axios');

const POLYGON_API_KEY = 'ArRNBD4RwUZFA5kE1Zu7IZiTwbFaHJl4';
const BASE_URL = 'https://api.polygon.io';
const symbols = ['AAPL', 'MSFT', 'GOOGL'];

async function getStockPricesForDateRange(symbol, startDate, endDate) {
    const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}`;
    try {
        const response = await axios.get(url, {
            params: {
                apiKey: POLYGON_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching stock prices for ${symbol}:`, error.message);
        throw error;
    }
}

async function fetchAllStocksData(symbols, startDate, endDate) {
    for (const symbol of symbols) {
        try {
            const data = await getStockPricesForDateRange(symbol, startDate, endDate);
            console.log(`Data for ${symbol}:`, data);
        } catch (error) {
            console.error(`Failed to fetch data for ${symbol}:`, error);
        }
    }
}

fetchAllStocksData(symbols, '2022-01-01', '2024-01-01');

module.exports = { getStockPricesForDateRange, fetchAllStocksData };