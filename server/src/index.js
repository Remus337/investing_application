const express = require('express');
const cors = require('cors');
const { fetchAllStocksData } = require('./routes/charts/stocks');
const registerRoute = require('./routes/login_process/register');
const loginRoute = require('./routes/login_process/login');
const validateRoute = require('./routes/login_process/validate');
const logoutRoute = require('./routes/login_process/logout');
const postsRoutes = require('./routes/social/posts');
const commentsRoutes = require('./routes/social/comments');
const tickersRoutes = require('./routes/charts/tickers'); 
const profileRoutes = require('./routes/user_management/profile');
const adminUsersRoutes = require('./routes/user_management/users');

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
app.use('/posts', postsRoutes);
app.use('/comments', commentsRoutes);
app.use('/tickers', tickersRoutes);
app.use('/profile', profileRoutes);
app.use('/users', adminUsersRoutes);

// Existing stocks endpoint
app.get('/stocks', async (req, res) => {
    const { tickers } = req.query;
    if (!tickers) {
        return res.status(400).send('Tickers are required.');
    }

    const tickerList = tickers.split(',');
    const today = new Date().toISOString().slice(0, 10);
    try {
        const data = await fetchAllStocksData(tickerList, '2023-06-01', today);
        res.json(data);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).send('Failed to fetch stock data.');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
