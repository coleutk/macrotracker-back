const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const mongoose = require('mongoose');

const DailyRecord = require('../models/dailyRecord');
const ArchivedRecord = require('../models/archivedRecord'); // Assuming the schema file is named archivedRecord.js
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

// For Adding Manual Macro Info
router.post('/addManual', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    const dailyManual = {
        _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
        calories: req.body.calories,
        protein: req.body.protein,
        carbs: req.body.carbs,
        fat: req.body.fat
    };

    DailyRecord.findOneAndUpdate(
        { userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
        { 
            $push: { manuals: dailyManual }, // Add the daily manual entry
            $inc: { // Increment the totals
                calories: dailyManual.calories,
                protein: dailyManual.protein,
                carbs: dailyManual.carbs,
                fat: dailyManual.fat
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


router.post('/resetDailyRecord', async (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now

    try {
        // Find the current daily record
        const currentRecord = await DailyRecord.findOne({ userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } });

        if (!currentRecord) {
            return res.status(404).json({ message: 'No current daily record found' });
        }

        // Find or create the archived record document for the user
        let archivedRecord = await ArchivedRecord.findOne({ userId: userId });
        if (!archivedRecord) {
            archivedRecord = new ArchivedRecord({
                userId: userId,
                records: []
            });
        }

        // Add the current daily record to the archived records
        archivedRecord.records.push(currentRecord);

        // Save the archived record
        await archivedRecord.save();

        // Reset the current daily record
        const resetRecord = await DailyRecord.findOneAndUpdate(
            { userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
            { $set: { foods: [], drinks: [], calories: 0, protein: 0, carbs: 0, fat: 0 } },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'Daily record archived and reset successfully',
            archivedRecord,
            resetRecord
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.get('/currentDailyRecord', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    
    DailyRecord.findOne({userId: userId, date: {$gte: new Date().setHours(0, 0, 0, 0)}})
        .populate('foods')
        .populate('drinks')
        .populate('manuals')
        .select('_id userId date calories protein carbs fat manuals foods drinks')
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

router.delete('/deleteFoodInput/:foodInputId', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    const foodInputId = req.params.foodInputId;

    console.log(`User ID: ${userId}`);
    console.log(`Food Input ID: ${foodInputId}`);

    // Find the daily record for the current date
    DailyRecord.findOne({ userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } })
        .then(dailyRecord => {
            if (!dailyRecord) {
                console.log('No daily record found for today');
                return res.status(404).json({ message: 'No daily record found for today' });
            }

            // Find the food item to remove
            const foodToRemove = dailyRecord.foods.id(foodInputId);
            if (!foodToRemove) {
                console.log('Food item not found');
                return res.status(404).json({ message: 'Food item not found' });
            }

            // Update the nutritional totals in the daily record
            dailyRecord.calories -= foodToRemove.food.calories;
            dailyRecord.protein -= foodToRemove.food.protein;
            dailyRecord.carbs -= foodToRemove.food.carbs;
            dailyRecord.fat -= foodToRemove.food.fat;

            // Save the updated daily record with new nutritional totals
            return dailyRecord.save();
        })
        .then(updatedRecord => {
            console.log(`Updated Record: ${updatedRecord}`);
            // Remove the food item from the daily record
            return DailyRecord.findOneAndUpdate(
                { _id: updatedRecord._id },
                { $pull: { foods: { _id: foodInputId } } },
                { new: true }
            );
        })
        .then(finalRecord => {
            console.log(`Final Record: ${finalRecord}`);
            res.status(200).json(finalRecord);
        })
        .catch(err => {
            console.log('Error processing request', err);
            res.status(500).json({ error: err });
        });
});


router.delete('/deleteDrinkInput/:drinkInputId', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    const drinkInputId = req.params.drinkInputId;

    console.log(`User ID: ${userId}`);
    console.log(`Drink Input ID: ${drinkInputId}`);

    // Find the daily record for the current date
    DailyRecord.findOne({ userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } })
        .then(dailyRecord => {
            if (!dailyRecord) {
                console.log('No daily record found for today');
                return res.status(404).json({ message: 'No daily record found for today' });
            }

            // Find the drink item to remove
            const drinkToRemove = dailyRecord.drinks.id(drinkInputId);
            if (!drinkToRemove) {
                console.log('Drink item not found');
                return res.status(404).json({ message: 'Drink item not found' });
            }

            // Update the nutritional totals in the daily record
            dailyRecord.calories -= drinkToRemove.drink.calories;
            dailyRecord.protein -= drinkToRemove.drink.protein;
            dailyRecord.carbs -= drinkToRemove.drink.carbs;
            dailyRecord.fat -= drinkToRemove.drink.fat;

            // Save the updated daily record with new nutritional totals
            return dailyRecord.save();
        })
        .then(updatedRecord => {
            console.log(`Updated Record: ${updatedRecord}`);
            // Remove the drink item from the daily record
            return DailyRecord.findOneAndUpdate(
                { _id: updatedRecord._id },
                { $pull: { drinks: { _id: drinkInputId } } },
                { new: true }
            );
        })
        .then(finalRecord => {
            console.log(`Final Record: ${finalRecord}`);
            res.status(200).json(finalRecord);
        })
        .catch(err => {
            console.log('Error processing request', err);
            res.status(500).json({ error: err });
        });
});


router.delete('/deleteManualInput/:manualInputId', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now
    const manualInputId = req.params.manualInputId;

    console.log(`User ID: ${userId}`);
    console.log(`Manual Input ID: ${manualInputId}`);

    // Find the daily record for the current date
    DailyRecord.findOne({ userId: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } })
        .then(dailyRecord => {
            if (!dailyRecord) {
                console.log('No daily record found for today');
                return res.status(404).json({ message: 'No daily record found for today' });
            }

            // Find the manual item to remove
            const manualToRemove = dailyRecord.manuals.id(manualInputId);
            if (!manualToRemove) {
                console.log('Manual item not found');
                return res.status(404).json({ message: 'Manual item not found' });
            }

            // Update the nutritional totals in the daily record
            dailyRecord.calories -= manualToRemove.calories;
            dailyRecord.protein -= manualToRemove.protein;
            dailyRecord.carbs -= manualToRemove.carbs;
            dailyRecord.fat -= manualToRemove.fat;

            // Save the updated daily record with new nutritional totals
            return dailyRecord.save();
        })
        .then(updatedRecord => {
            console.log(`Updated Record: ${updatedRecord}`);
            // Remove the manual item from the daily record
            return DailyRecord.findOneAndUpdate(
                { _id: updatedRecord._id },
                { $pull: { manuals: { _id: manualInputId } } },
                { new: true }
            );
        })
        .then(finalRecord => {
            console.log(`Final Record: ${finalRecord}`);
            res.status(200).json(finalRecord);
        })
        .catch(err => {
            console.log('Error processing request', err);
            res.status(500).json({ error: err });
        });
});



module.exports = router;