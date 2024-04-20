const express = require('express');
const cors = require('cors');
const { fetchAllStocksData } = require('./routes/stocks');

const app = express();
const port = 3001;

app.use(cors());
app.get('/stocks', async (req, res) => {
    try {
        const data = await fetchAllStocksData(['AAPL', 'MSFT', 'GOOGL'], '2022-01-01', '2024-01-01');
        res.format({
            'text/html': function () {
                let html = '<h1>Stock Prices</h1>';
                if (data && Array.isArray(data)) {
                    data.forEach(stock => {
                        html += `<h2>${stock.symbol}</h2><pre>${JSON.stringify(stock.data, null, 2)}</pre>`;
                    });
                } else {
                    html += '<p>No data available</p>';
                }
                res.send(html);
            },
            'application/json': function () {
                res.json(data);
            }
        });
    } catch (error) {
        console.error('Error while processing data:', error);
        res.status(500).send('Failed to fetch stock data: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
