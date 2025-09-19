const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const Attempt = require('../models/Attempt');

router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const leaderboard = await Attempt.aggregate([
      { $sort: { score: -1, totalTime: 1 } },
      { 
        $group: { 
          _id: "$username", 
          score: { $first: "$score" },
          totalTime: { $first: "$totalTime" },
          date: { $first: "$date" }
        } 
      },
      { $sort: { score: -1, totalTime: 1 } },
      { $limit: 10 }
    ]);

    // Mapeamos para que coincida con el frontend
    const mapped = leaderboard.map(u => ({
      username: u._id,
      score: u.score,
      time: u.totalTime,
      date: u.date
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al cargar leaderboard' });
  }
});






// Historial personal
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const attempts = await Attempt.find({ username: req.user.username }).sort({ date: -1 });
    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener historial' });
  }
});

module.exports = router;
