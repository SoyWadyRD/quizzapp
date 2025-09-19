// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ msg: 'No hay token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

req.user = { id: decoded.id, username: decoded.username };

    next();
  } catch (err) {
    return res.status(403).json({ msg: 'Token inválido' });
  }
};

module.exports = { authMiddleware };
