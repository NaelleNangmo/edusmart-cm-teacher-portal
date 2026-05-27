'use strict';

/**
 * Configuration Jest — EDUSMART-CM Backend
 * Compte F — Setup environnement de test
 */

module.exports = {
  // Environnement Node.js (pas de DOM)
  testEnvironment: 'node',

  // Fichiers de test reconnus
  testMatch: ['**/tests/**/*.test.js'],

  // Timeout global (30s pour les tests d'intégration avec DB)
  testTimeout: 30000,

  // Fichier de setup chargé avant chaque suite
  setupFiles: ['./tests/setup.js'],

  // Forcer la sortie après les tests
  forceExit: true,

  // Détecter les handles ouverts
  detectOpenHandles: true,

  // ── Configuration de la couverture ──────────────────────────
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',           // Point d'entrée — testé indirectement
  ],

  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  coverageReporters: [
    'text',          // Affichage console
    'text-summary',  // Résumé console
    'lcov',          // Pour SonarQube / Codecov
    'html',          // Rapport HTML navigable
    'json-summary',  // Résumé JSON pour CI/CD
  ],

  coverageDirectory: 'coverage',
};
