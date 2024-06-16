const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const mongoose = require('mongoose');

const DailyRecord = require('../models/dailyRecord');
const Food = require('../models/food');
const Drink = require('../models/drink');

router.post('/addFood', checkAuth, (req, res, next) => {
    const userId = req.userData.userId;
    const foodId = req.body.foodId;

    DailyRecord.findOneAndUpdate(
        {userId: userId, date: {$gte: new Date().setHours(0, 0, 0, 0)}},
        {$push: {foods: foodId}}, // Add food ID to list of foods
        {new: true, upsert: true} // Create a new record if none exists, return updated document
    )
    .then(record => {
        Food.findById(foodId)
            .then(food => {
                // Update the record's nutritional values
                record.calories += food.calories;
                record.protein += food.protein;
                record.carbs += food.carbs;
                record.fats += food.fats;
                return record.save();
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

router.get('/currentDailyRecord', checkAuth, (req, res, next) => {
    const userId = req.userData.userId;
    
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