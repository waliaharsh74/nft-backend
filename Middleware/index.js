// authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'harshndsjadjakswalia74nds759'

function authenticateToken(req, res, next) {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).send('Token required');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
