const mongoose = require('mongoose');

const Food = require('../models/food');

exports.foods_get_all = (req, res, next) => {
    Food.find({ user: req.userData.userId })
        .select('_id name weight calories protein carbs fat')
        .exec()
        .then(docs => {
            //console.log(docs);
            const response = {
                count: docs.length,
                foods: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        weight: doc.weight,
                        calories: doc.calories,
                        protein: doc.protein,
                        carbs: doc.carbs,
                        fat: doc.fat,
                        user: doc.user
                        // request: {
                        //     type: 'GET',
                        //     url: 'http://localhost:3000/foods/' + doc._id
                        // }
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

exports.foods_create_food = (req, res, next) => {
    // Create new food with object
    const food = new Food({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        weight: {
            value: req.body.weight.value,
            unit: req.body.weight.unit
        },
        calories: req.body.calories,
        protein: req.body.protein,
        carbs: req.body.carbs !== undefined ? req.body.carbs : null,
        fat: req.body.fat !== undefined ? req.body.fat : null,
        user: req.userData.userId // Associate goal with the authenticated user
    });

    food
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Added ' + req.body.name + '!',
                createdFood: {
                    _id: result._id,
                    name: result.name,
                    weight: result.weight,
                    calories: result.calories,
                    carbs: result.carbs,
                    protein: result.protein,
                    fat: result.fat,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/foods/' + result._id
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

exports.foods_get_food = (req, res, next) => {
    const id = req.params.foodId;
    Food.findById(id)
        .select('_id name weight calories carbs protein fat')
        .exec()
        .then(doc => {
            console.log('From database', doc);

            if (doc) {
                res.status(200).json({
                    food: {
                        _id: doc._id,
                        name: doc.name,
                        weight: {
                            value: doc.weight.value,
                            unit: doc.weight.unit
                        },
                        calories: doc.calories,
                        carbs: {
                            value: doc.carbs,
                            unit: 'g' // Assuming grams for carbs
                        },
                        protein: {
                            value: doc.protein,
                            unit: 'g' // Assuming grams for protein
                        },
                        fat: {
                            value: doc.fat,
                            unit: 'g' // Assuming grams for fat
                        }
                    },
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/foods"
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

exports.foods_update_food = (req, res, next) => {
    const id = req.params.foodId;
    const updateOps = {};

    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    // Handle null values for carbs and fat
    if (updateOps.hasOwnProperty('carbs') && (updateOps['carbs'] === '' || updateOps['carbs'] === null)) {
        updateOps['carbs'] = null;
    }
    if (updateOps.hasOwnProperty('fat') && (updateOps['fat'] === '' || updateOps['fat'] === null)) {
        updateOps['fat'] = null;
    }

    Food.updateOne({ _id: id, user: req.userData.userId }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Attribute updated'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.foods_delete_food = (req, res, next) => {
    const id = req.params.foodId;
    
    // First, find the food by its ID to get its name
    Food.findById({ _id: id, user: req.userData.userId })
        .select('name') // Only select the 'name' field
        .exec()
        .then(food => {
            if (!food) {
                return res.status(404).json({
                    message: 'Food not found'
                });
            }
            
            // Store the name of the food
            const foodName = food.name;

            // Delete the food from the database
            Food.deleteOne({ _id: id, user: req.userData.userId })
                .exec()
                .then(result => {
                    res.status(200).json({
                        message: foodName + ' deleted',
                        deletedFood: foodName, // Include the name of the deleted food in the response
                        request: {
                            type: 'POST',
                            url: 'http://localhost:3000/foods',
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