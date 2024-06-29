const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const mongoose = require('mongoose');

const DailyRecord = require('../models/dailyRecord');
const Food = require('../models/food');
const Drink = require('../models/drink');

router.post('/addFood', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    const food = {
        name: req.body.name,
        weight: {
            value: req.body.weightValue,
            unit: req.body.weightUnit
        },
        calories: req.body.calories,
        protein: req.body.protein,
        carbs: req.body.carbs,
        fat: req.body.fat
    };

    DailyRecord.findOneAndUpdate(
        { userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
        { 
            $push: { foods: food }, // Add the detailed food entry
            $inc: { // Increment the totals
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat
            }
        },
        { new: true, upsert: true } // Create a new record if none exists, return updated document
    )
    .then(updatedRecord => {
        res.status(200).json({
            updatedRecord
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/addDrink', checkAuth, (req, res, next) => {
    const userId = req.userData.userId;
    const drinkId = req.body.drinkId;

    DailyRecord.findOneAndUpdate(
        {userId: userId, date: {$gte: new Date().setHours(0, 0, 0, 0)}},
        {$push: {drinks: drinkId}},
        {new: true, upsert: true}
    )
    .then(record => {
        Drink.findById(drinkId)
            .then(drink => {
                record.calories += drink.calories;
                record.protein += drink.protein;
                record.carbs += drink.carbs;
                record.fats += drink.fats;
            })
            .then(updatedRecord => {
                res.status(200).json({
                    updatedRecord
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    }); 
});

router.post('/resetDailyRecord', checkAuth, (req, res, next) => {
    const userId = req.userData.userId;

    DailyRecord.findOneAndUpdate(
        {userId: userId, date: {$gte: new Date().setHours(0, 0, 0, 0)}},
        {$set: {foods: [], drinks: [], calories: 0, protein: 0, carbs: 0, fats: 0}},
        {new: true, upsert: true}
    )
    .then(record => {
        res.status(200).json({
            message: 'Daily Record Reset', record
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

router.get('/currentDailyRecord', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    
    DailyRecord.findOne({userId: userId, date: {$gte: new Date().setHours(0, 0, 0, 0)}})
        .populate('foods')
        .populate('drinks')
        .exec()
        .then(record => {
            if(!record) {
                return res.status(404).json({
                    message: 'No daily record found for today'
                });
            }
            res.status(200).json(record);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

module.exports = router;