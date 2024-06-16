const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const GoalsController = require('../controllers/goals');

// Get All Goals
router.get('/', checkAuth, GoalsController.goals_get_all);

// Create New Goal
router.post('/', checkAuth, GoalsController.goals_create_goal);

// Get Specific Goal
router.get('/:goalId', checkAuth, GoalsController.goals_get_goal);

// Update Goal attribute(s)
/* Template for JSON raw body:
[
    { "propName": "name", "value": "New Goal Name" },
    { "propName": "calorieGoal", "value": 2700 }
]
*/

// Update Specific goal
router.patch('/:goalId', checkAuth, GoalsController.goals_update_goal);

// Delete Goal
router.delete('/:goalId', checkAuth, GoalsController.goals_delete_goal);

module.exports = router;