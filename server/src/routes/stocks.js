const axios = require('axios');

const POLYGON_API_KEY = 'ArRNBD4RwUZFA5kE1Zu7IZiTwbFaHJl4';
const BASE_URL = 'https://api.polygon.io';

async function getStockPrice(symbol) {
    try {
        const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/day/2023-01-09/2023-01-09`;
        const response = await axios.get(url, {
            params: {
                apiKey: POLYGON_API_KEY
            }
        });

        return response.data;
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error.message);
        
        throw error;
    }
}

module.exports = { getStockPrice };
