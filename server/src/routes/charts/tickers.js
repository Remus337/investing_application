const express = require('express');
const axios = require('axios');
const db = require('../../config/db');
const router = express.Router();

const POLYGON_API_KEY = 'ArRNBD4RwUZFA5kE1Zu7IZiTwbFaHJl4';
const TICKERS_API_URL = 'https://api.polygon.io/v3/reference/tickers';
const RATE_LIMIT_DELAY = 15000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch and save tickers to the database
router.get('/fetch', async (req, res) => {
    let nextUrl = TICKERS_API_URL;
    let tickersSaved = 0;

    try {
        // Perform the initial fetch
        const response = await axios.get(TICKERS_API_URL, {
            params: { 
                market: 'stocks',
                limit: 1000,
                sort: 'ticker',
                apiKey: POLYGON_API_KEY,
            },
        });

        const tickers = response.data.results;
        nextUrl = response.data.next_url;

        // Save initial tickers to the database
        for (const ticker of tickers) {
            const { ticker: symbol, name, market, locale, currency_name: currency, active, last_updated_utc } = ticker;
            await db.promise().query(
                `INSERT IGNORE INTO tickers (ticker, name, market, locale, currency, active, last_updated_utc)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [symbol, name, market, locale, currency, active, last_updated_utc]
            );
        }

        tickersSaved += tickers.length;
        console.log(`Initial fetch saved ${tickers.length} tickers.`);

        // Process additional pages if next_url exists
        while (nextUrl) {
            console.log(`Fetching additional tickers from: ${nextUrl}`);
            const nextResponse = await axios.get(nextUrl, {
                params: { apiKey: POLYGON_API_KEY }, // Attach API key to next_url
            });

            const nextTickers = nextResponse.data.results;
            nextUrl = nextResponse.data.next_url;

            // Save next batch of tickers to the database
            for (const ticker of nextTickers) {
                const { ticker: symbol, name, market, locale, currency_name: currency, active, last_updated_utc } = ticker;
                await db.promise().query(
                    `INSERT IGNORE INTO tickers (ticker, name, market, locale, currency, active, last_updated_utc)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [symbol, name, market, locale, currency, active, last_updated_utc]
                );
            }

            tickersSaved += nextTickers.length;
            console.log(`Fetched and saved ${nextTickers.length} tickers. Total saved: ${tickersSaved}`);
            if (nextUrl) {
                await delay(RATE_LIMIT_DELAY);
            }
        }

        res.status(200).send(`Tickers fetched and updated successfully. Total saved: ${tickersSaved}`);
    } catch (error) {
        console.error('Error fetching tickers:', error.message);
        res.status(500).send('Failed to fetch tickers: ' + error);
    }
});

// Fetch all tickers from the database
router.get('/', async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM tickers WHERE active = 1 ORDER BY ticker ASC');
        res.json(results);
    } catch (error) {
        console.error('Error fetching tickers:', error.message);
        res.status(500).send('Failed to fetch tickers: ' + error);
    }
});

module.exports = router;
