'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const { testConnection } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const absencesRouter = require('./modules/absences/absences.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EDUSMART-CM API opérationnelle',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/absences', absencesRouter);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  (async () => {
    try {
      await testConnection();
      console.log('[DB] Connexion PostgreSQL réussie ✓');
      app.listen(config.port, () => {
        console.log(`[SERVER] EDUSMART-CM API démarrée sur http://localhost:${config.port}`);
        console.log(`[SERVER] Environnement : ${config.nodeEnv}`);
      });
    } catch (err) {
      console.error('[DB] Impossible de se connecter à PostgreSQL :', err.message);
      process.exit(1);
    }
  })();
}

module.exports = app;
