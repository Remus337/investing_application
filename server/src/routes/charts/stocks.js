require('dotenv').config();
const axios = require('axios');

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const BASE_URL = process.env.POLYGON_BASE_URL;
const cache = {};

async function getStockPricesForDateRange(symbol, startDate, endDate) {
    const cacheKey = `${symbol}-${startDate}-${endDate}`;
    if (cache[cacheKey]) {
        console.log(`Using cached data for ${symbol}`);
        return cache[cacheKey];
    }

    const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}`;
    try {
        const response = await axios.get(url, {
            params: { apiKey: POLYGON_API_KEY }
        });
        cache[cacheKey] = response.data;
        return response.data;
    } catch (error) {
        console.error(`Error fetching stock prices for ${symbol}:`, error.message);
        throw error;
    }
}

async function fetchAllStocksData(symbols, startDate, endDate) {
    const allData = [];
    for (const symbol of symbols) {
        try {
            const data = await getStockPricesForDateRange(symbol, startDate, endDate);
            if (data && Array.isArray(data.results)) {
                allData.push({ symbol, data: data.results });
            } else {
                console.error(`No data returned for ${symbol}`);
                allData.push({ symbol, data: [] });
            }
        } catch (error) {
            console.error(`Failed to fetch data for ${symbol}:`, error);
            allData.push({ symbol, data: [] });
        }
    }
    return allData;
}

module.exports = { getStockPricesForDateRange, fetchAllStocksData };
