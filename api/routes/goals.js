const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const GoalsController = require('../controllers/goals');

// Get All Goals
router.get('/', GoalsController.goals_get_all);

// Create New Goal
router.post('/', GoalsController.goals_create_goal);

// Get Specific Goal
router.get('/:goalId', GoalsController.goals_get_goal);

// Update Goal attribute(s)
/* Template for JSON raw body:
[
    { "propName": "name", "value": "New Goal Name" },
    { "propName": "calorieGoal", "value": 2700 }
]
*/

// Update Specific goal
router.patch('/:goalId', GoalsController.goals_update_goal);

// Delete Goal
router.delete('/:goalId', GoalsController.goals_delete_goal);

module.exports = router;