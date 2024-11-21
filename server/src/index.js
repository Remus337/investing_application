const express = require('express');
const cors = require('cors');
const { fetchAllStocksData } = require('./routes/stocks');
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');
const validateRoute = require('./routes/validate');
const logoutRoute = require('./routes/logout');

const app = express();
const port = 3001;
const today = new Date().toISOString().slice(0, 10);

app.use(cors());
app.use(express.json()); // Enable JSON parsing for POST requests

// Use the separate route files
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/validate', validateRoute);
app.use('/logout', logoutRoute);

// Existing stocks endpoint
app.get('/stocks', async (req, res) => {
    try {
        const data = await fetchAllStocksData(['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NFLX', 'NVDA', 'AMD'], '2023-06-01', today);
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
