const express = require('express');
const { getStockPrice } = require('./routes/stocks');

const app = express();
const port = 3000;

app.get('/stock/:symbol', async (req, res) => {
    try {
        const stockPrice = await getStockPrice(req.params.symbol);
        res.json(stockPrice);
    } catch (error) {
        res.status(500).send('Error fetching stock price');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
