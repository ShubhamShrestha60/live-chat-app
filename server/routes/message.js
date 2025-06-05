const express = require('express');
const Message = require('../models/Message');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:email', verifyToken, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.email, receiver: req.params.email },
      { sender: req.params.email, receiver: req.user.email }
    ]
  });
  res.json(messages);
});

module.exports = router;