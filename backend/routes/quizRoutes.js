const express = require('express');
const router = express.Router();
const { saveAttempt, getResult } = require('../controllers/quizController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Guardar intento
router.post('/attempt', authMiddleware, saveAttempt);

// Obtener resultado
router.get('/result/:attemptId', authMiddleware, getResult);

module.exports = router;
