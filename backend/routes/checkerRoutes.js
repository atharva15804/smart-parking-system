// backend/routes/checkerRoutes.js

const express = require('express');
const router = express.Router();
const {
  verifyTicket,
  logVehicle,
  getCheckerLogs,
} = require('../controllers/checkerController');
const { protect } = require('../middleware/authMiddleware'); // 'protect' is enough

// We protect all routes to make sure a checker is logged in
router.use(protect);

// POST /api/checker/verify
router.post('/verify', verifyTicket);

// POST /api/checker/log
router.post('/log', logVehicle);

// GET /api/checker/logs
router.get('/logs', getCheckerLogs);

module.exports = router;