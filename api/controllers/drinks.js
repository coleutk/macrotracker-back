const mongoose = require('mongoose');

const Drink = require('../models/drink');

exports.drinks_get_all = (req, res, next) => {
    Drink.find()
        .select('_id name volume calories carbs protein fat')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                drinks: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        volume: doc.volume,
                        calories: doc.calories,
                        protein: doc.protein,
                        carbs: doc.carbs,
                        fat: doc.fat,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/drinks/' + doc._id
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

exports.drinks_create_drink = (req, res, next) => {
    // Create new drink with object
    const drink = new Drink({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        volume: {
            value: req.body.volume.value,
            unit: req.body.volume.unit
        },
        calories: req.body.calories,
        carbs: req.body.carbs,
        protein: req.body.protein,
        fat: req.body.fat
    });

    drink
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Added ' + req.body.name + '!',
                createdDrink: {
                    _id: result._id,
                    name: result.name,
                    volume: result.volume,
                    calories: result.calories,
                    carbs: result.carbs,
                    protein: result.protein,
                    fat: result.fat,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/drinks/' + result._id
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

exports.drinks_get_drink = (req, res, next) => {
    const id = req.params.drinkId;
    Drink.findById(id)
        .select('_id name volume calories carbs protein fat')
        .exec()
        .then(doc => {
            console.log('From database', doc);

            if (doc) {
                res.status(200).json({
                    drink: {
                        _id: doc._id,
                        name: doc.name,
                        volume: {
                            value: doc.volume.value,
                            unit: doc.volume.unit
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
                        url: 'http://localhost:3000/drinks'
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

exports.drinks_update_drink = (req, res, next) => {
    const id = req.params.drinkId;
    const updateOps = {};

    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Drink.updateOne({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Attribute updated',
                url: 'http://localhost:3000/drinks/' + id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.drinks_delete_drink = (req, res, next) => {
    const id = req.params.drinkId;
    
    // First, find the drink by its ID to get its name
    Drink.findById(id)
        .select('name') // Only select the 'name' field
        .exec()
        .then(drink => {
            if (!drink) {
                return res.status(404).json({
                    message: 'Drink not found'
                });
            }
            
            // Store the name of the drink
            const drinkName = drink.name;

            // Delete the drink from the database
            Drink.deleteOne({_id: id})
                .exec()
                .then(result => {
                    res.status(200).json({
                        message: drinkName + ' deleted',
                        deletedDrink: drinkName, // Include the name of the deleted drink in the response
                        request: {
                            type: 'POST',
                            url: 'http://localhost:3000/drinks'
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