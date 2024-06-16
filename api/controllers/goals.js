const mongoose = require('mongoose');

const Goal = require('../models/goal');
const User = require('../models/user');

exports.goals_get_all = (req, res, next) => {
    Goal.find()
        .select('_id name calorieGoal proteinGoal carbGoal fatGoal')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                goals: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        calorieGoal: doc.calorieGoal,
                        proteinGoal: {
                            value: doc.proteinGoal,
                            unit: 'g'
                        },
                        carbGoal: {
                            value: doc.carbGoal,
                            unit: 'g'
                        },
                        fatGoal: {
                            value: doc.fatGoal,
                            unit: 'g'
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/goals/' + doc._id
                        }
                    }
                })
            };

            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.goals_create_goal = (req, res, next) => {
    const goal = new Goal({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        calorieGoal: req.body.calorieGoal,
        proteinGoal: req.body.proteinGoal,
        carbGoal: req.body.carbGoal,
        fatGoal: req.body.fatGoal
    });

    goal
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Added ' + req.body.name + '!',
                createdGoal: {
                    _id: result._id,
                    name: result.name,
                    calorieGoal: result.calorieGoal,
                    proteinGoal: result.proteinGoal,
                    carbGoal: result.carbGoal,
                    fatGoal: result.fatGoal,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/goals/' + result._id
                    }
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

exports.goals_get_goal = (req, res, next) => {
    const id = req.params.goalId;
    Goal.findById(id)
        .select('_id name calorieGoal proteinGoal carbGoal fatGoal')
        .exec()
        .then(doc => {
            console.log('From database', doc)

            if (doc) {
                res.status(200).json({
                    goal: {
                        _id: doc.id,
                        name: doc.name,
                        calorieGoal: doc.calorieGoal,
                        proteinGoal: {
                            value: doc.proteinGoal,
                            unit: 'g'
                        },
                        carbGoal: {
                            value: doc.carbGoal,
                            unit: 'g'
                        },
                        fatGoal: {
                            value: doc.fatGoal,
                            unit: 'g'
                        }
                    },
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/goals'
                    }
                });
            } else {
                res.status(404).json({ message: 'No valid entry found for provided ID' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.goals_update_goal = (req, res, next) => {
    const id = req.params.goalId;
    const updateOps = {};

    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Goal.updateOne({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Attribute updated',
                url: 'http://localhost:3000/goals/' + id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.goals_delete_goal = (req, res, next) => {
    const id = req.params.goalId;
    
    // First, find the goal by its ID to get its name
    Goal.findById(id)
        .select('name') // Only select the 'name' field
        .exec()
        .then(goal => {
            if (!goal) {
                return res.status(404).json({
                    message: 'Goal not found'
                });
            }
            
            // Store the name of the goal
            const goalName = goal.name;

            // Delete the goal from the database
            Goal.deleteOne({_id: id})
                .exec()
                .then(result => {
                    res.status(200).json({
                        message: goalName + ' deleted',
                        deletedGoal: goalName, // Include the name of the deleted goal in the response
                        request: {
                            type: 'POST',
                            url: 'http://localhost:3000/goals'
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}