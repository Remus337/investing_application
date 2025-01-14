const db = require('./db');

const migrations = async () => {
    try {
        console.log('Connected to the MySQL database');

        // Check and create `users` table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT(11) AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                surname VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                nickname VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                is_admin TINYINT(4) DEFAULT 0,
                is_validated TINYINT(4) DEFAULT 0,
                validation_key VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                INDEX (email),
                UNIQUE (nickname)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Users table ensured.');

        // Check if `is_superadmin` column exists and add if not
        const [columns] = await db.promise().query(`
            SHOW COLUMNS FROM users LIKE 'is_superadmin';
        `);

        if (columns.length === 0) {
            await db.promise().query(`
                ALTER TABLE users ADD COLUMN is_superadmin TINYINT(4) DEFAULT 0;
            `);
            console.log('Added `is_superadmin` column to users table.');
        } else {
            console.log('`is_superadmin` column already exists.');
        }

        // Check and create `posts` table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Posts table ensured.');

        // Check and create `comments` table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_id INT NOT NULL,
                comment TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Comments table ensured.');

        // Check and create `tickers` table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS tickers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticker VARCHAR(10) NOT NULL UNIQUE,
                name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                market VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                locale VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                currency VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                active BOOLEAN DEFAULT TRUE,
                last_updated_utc DATETIME DEFAULT NULL,
                INDEX (ticker)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Tickers table ensured.');

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            transaction_id VARCHAR(11) DEFAULT NULL,
            ticker VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            amount_remained DECIMAL(10, 2) DEFAULT 0,
            price_per_share DECIMAL(10, 2) NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            payment_status ENUM('pending', 'completed', 'failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
            payment_order_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            payment_account VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (ticker) REFERENCES tickers(ticker),
            UNIQUE (transaction_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Transactions table ensured.');

        // Check and create `transactions_sold` table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS transactions_sold (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            ticker VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            price_per_share DECIMAL(10, 2) NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            gain_loss DECIMAL(10, 2) DEFAULT 0, -- Gain/Loss column
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (ticker) REFERENCES tickers(ticker)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Transactions_sold table ensured.');

        // Update all tables to ensure utf8mb4 support
        const tables = ['users', 'posts', 'comments', 'tickers'];
        for (const table of tables) {
            await db.promise().query(`
                ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            `);
            console.log(`${table} table updated to utf8mb4.`);
        }
    } catch (err) {
        console.error('Error running migrations:', err);
    } finally {
        db.end();
    }
};

migrations();
