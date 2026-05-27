'use strict';

const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  if (config.nodeEnv !== 'test') {
    console.log('[DB] Nouvelle connexion PostgreSQL établie');
  }
});

pool.on('error', (err) => {
  console.error('[DB] Erreur inattendue sur le pool de connexions :', err.message);
});

/**
 * Teste la connexion à la base de données
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    return true;
  } finally {
    client.release();
  }
}

/**
 * Exécute une requête SQL avec paramètres
 * @param {string} text - Requête SQL
 * @param {Array} params - Paramètres
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Obtient un client du pool (pour les transactions)
 * @returns {Promise<import('pg').PoolClient>}
 */
async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient, testConnection };
