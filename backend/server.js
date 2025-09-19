const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); // Importar conexión
const path = require('path');
const helmet = require('helmet');

// Crear la app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir frontend estático (DESPUÉS de crear app)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quiz', quizRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);




// Conectar a MongoDB
connectDB();

// Rutas de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

// Configura CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      styleSrcElem: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));



// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🟢 🚀 Servidor corriendo en puerto ${PORT}`));
