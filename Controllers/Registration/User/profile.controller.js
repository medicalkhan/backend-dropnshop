
const { poolPromise } = require('../../../Configs/db.config');

const getOwnProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', userId)
            .query('SELECT id, username, email, role FROM users WHERE id = @userId');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.recordset[0];
        res.json(user);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'An error occurred while retrieving the profile' });
    }
};

module.exports = {
    getOwnProfile
};
