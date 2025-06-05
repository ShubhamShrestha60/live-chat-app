const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.sendStatus(403);
  }
}

function verifyTokenSocket(socket, next) {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Invalid Token'));
  }
}

module.exports = { verifyToken, verifyTokenSocket };