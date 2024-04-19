const express = require('express');
const { getStockPricesForDateRange } = require('./routes/stocks');

const app = express();
const port = 3001;

app.get('/stock/:symbol/range/:startDate/:endDate', async (req, res) => {
    const { symbol, startDate, endDate } = req.params;
    try {
        const stockData = await getStockPricesForDateRange(symbol, startDate, endDate);
        res.json(stockData);
    } catch (error) {
        console.error(`Error while fetching data for ${symbol}: ${error.message}`);
        res.status(500).send('Error fetching stock prices');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});