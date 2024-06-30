const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const mongoose = require('mongoose');

const DailyRecord = require('../models/dailyRecord');
const Food = require('../models/food');
const Drink = require('../models/drink');

router.post('/addFood', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    const dailyFood = {
        food: {
            _id: req.body._id,
            name: req.body.name,
            weight: {
                value: req.body.weight.value,
                unit: req.body.weight.unit
            },
            calories: req.body.calories,
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat
        },
        servings: req.body.servings // Add the serving size here
    };

    DailyRecord.findOneAndUpdate(
        { userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
        { 
            $push: { foods: dailyFood }, // Add the daily food entry
            $inc: { // Increment the totals
                calories: dailyFood.food.calories,
                protein: dailyFood.food.protein,
                carbs: dailyFood.food.carbs,
                fat: dailyFood.food.fat
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


router.post('/addDrink', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    const dailyDrink = {
        drink: {
            _id: req.body._id,
            name: req.body.name,
            volume: {
                value: req.body.volume.value,
                unit: req.body.volume.unit
            },
            calories: req.body.calories,
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat
        },
        servings: req.body.servings // Add the serving size here
    };

    DailyRecord.findOneAndUpdate(
        { userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
        { 
            $push: { drinks: dailyDrink }, // Add the daily drink entry
            $inc: { // Increment the totals
                calories: dailyDrink.drink.calories,
                protein: dailyDrink.drink.protein,
                carbs: dailyDrink.drink.carbs,
                fat: dailyDrink.drink.fat
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
        .select('_id userId date calories protein carbs fat foods drinks')
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