const Attempt = require('../models/Attempt');

// Obtener resultados de un intento por ID
const getResult = async (req, res) => {
  const { attemptId } = req.params;

  try {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ msg: 'Intento no encontrado' });

    console.log(`✅ [QUIZZ FINALIZADO] Usuario: ${attempt.username}, 
      Correctas: ${attempt.correct}, 
      Incorrectas: ${attempt.incorrect}, 
      Sin responder: ${attempt.unanswered}, 
      Puntaje: ${attempt.score}, 
      Tiempo total: ${attempt.totalTime}s
    `);

    res.json({
      correct: attempt.correct,
      incorrect: attempt.incorrect,
      unanswered: attempt.unanswered,
      score: attempt.score,
      totalTime: attempt.totalTime
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// Guardar intento al finalizar el quizz
const saveAttempt = async (req, res) => {
  const { correct, incorrect, unanswered, score, totalTime } = req.body;
  const username = req.user.username; // viene del JWT en authMiddleware

  try {
    console.log(`🚀 [QUIZZ INICIADO] Usuario: ${username}`);

    const attempt = new Attempt({
      username,
      correct,
      incorrect,
      unanswered,
      score,
      totalTime
    });

    await attempt.save();

    console.log(`💾 [INTENTO GUARDADO] Usuario: ${username}, ID del intento: ${attempt._id}`);

    res.status(201).json({ msg: 'Intento guardado', attemptId: attempt._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al guardar el intento' });
  }
};

module.exports = { saveAttempt, getResult };
