const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../../../Configs/db.config');

const register = async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    try {
        const pool = await poolPromise;

        const userCheck = await pool.request()
            .input('email', email)
            .input('username', username)
            .query('SELECT * FROM users WHERE email = @email OR username = @username');

        if (userCheck.recordset.length > 0) {
            return res.status(409).json({ error: 'User with this email or username already exists' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const defaultRole = 'user';

        const result = await pool.request()
            .input('username', username)
            .input('email', email)
            .input('password_hash', passwordHash)
            .input('role', defaultRole)
            .query(`
                INSERT INTO users (username, email, password_hash, role)
                OUTPUT INSERTED.id
                VALUES (@username, @email, @password_hash, @role);
            `);

        const userId = result.recordset[0].id;

        const token = jwt.sign(
            { id: userId, email, role: defaultRole },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({ message: 'User registered successfully', userId, token });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
};

module.exports = {
    register
};
