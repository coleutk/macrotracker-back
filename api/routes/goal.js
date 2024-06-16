const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const GoalController = require('../controllers/goal');

// Select CURRENT Goal
router.post('/', checkAuth, GoalController.goals_set_current_goal);

module.exports = router;