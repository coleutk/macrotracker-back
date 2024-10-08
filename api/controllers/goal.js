const mongoose = require('mongoose');

const Goal = require('../models/goal');
const User = require('../models/user');

// Set CURRENT User Specified Goal
exports.goals_set_current_goal = (req, res, next) => {
    //const userId = req.userData.userId;
    const userId = req.userData.userId;
    const goalId = req.body.goalId;

    User.updateOne({_id: userId}, {$set: {selectedGoal: goalId}})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Current goal set',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/goals/' + goalId
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}