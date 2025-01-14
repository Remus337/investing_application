const express = require('express');
const db = require('../../config/db');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

router.post('/analyse', (req, res) => {
    const { minimizedStockData } = req.body;

    if (!minimizedStockData || !Array.isArray(minimizedStockData)) {
        return res.status(400).json({ error: 'Invalid stock data provided.' });
    }

    const calculateChange = (start, end) => {
        if (!start || !end || start.c === 0) return null;
        return ((end.c - start.c) / start.c) * 100;
    };

    const now = Date.now();

    const analysisResults = minimizedStockData.map((stock) => {
        const { data, symbol } = stock;

        if (!data || data.length < 2) {
            return {
                ticker: symbol,
                analysis: [
                    { range: 'Since start', summary: 'No sufficient data available.' },
                    { range: 'Since 1 year ago', summary: 'No sufficient data available.' },
                    { range: 'Since 1 month ago', summary: 'No sufficient data available.' },
                    { range: 'Since 1 week ago', summary: 'No sufficient data available.' },
                ],
            };
        }

        const firstDataPoint = data[0];
        const lastDataPoint = data[data.length - 1];
        const oneYearAgoTimestamp = now - 365 * 24 * 60 * 60 * 1000;
        const oneMonthAgoTimestamp = now - 30 * 24 * 60 * 60 * 1000;
        const oneWeekAgoTimestamp = now - 7 * 24 * 60 * 60 * 1000;

        const oneYearAgoData = data.find((point) => point.t >= oneYearAgoTimestamp && point.t <= now);
        const oneMonthAgoData = data.find((point) => point.t >= oneMonthAgoTimestamp && point.t <= now);
        const oneWeekAgoData = data.find((point) => point.t >= oneWeekAgoTimestamp && point.t <= now);

        const changes = [
            { range: 'Since start', change: calculateChange(firstDataPoint, lastDataPoint), startDate: new Date(firstDataPoint.t).toLocaleDateString() },
            { range: 'Since 1 year ago', change: calculateChange(oneYearAgoData, lastDataPoint), startDate: oneYearAgoData ? new Date(oneYearAgoData.t).toLocaleDateString() : null },
            { range: 'Since 1 month ago', change: calculateChange(oneMonthAgoData, lastDataPoint), startDate: oneMonthAgoData ? new Date(oneMonthAgoData.t).toLocaleDateString() : null },
            { range: 'Since 1 week ago', change: calculateChange(oneWeekAgoData, lastDataPoint), startDate: oneWeekAgoData ? new Date(oneWeekAgoData.t).toLocaleDateString() : null },
        ];

        const analysis = changes.map(({ range, change, startDate }) => {
            if (change === null || !startDate) {
                return { range, summary: 'No sufficient data available.' };
            }
            const summary = change > 0
                ? `${range} (since ${startDate}), increased by ${change.toFixed(2)}%`
                : change < 0
                    ? `${range} (since ${startDate}), decreased by ${Math.abs(change).toFixed(2)}%`
                    : `${range} (since ${startDate}), stayed the same`;
            return { range, summary };
        });

        return { ticker: symbol, analysis };
    });

    res.json({ analysisResults });
});


module.exports = router;
