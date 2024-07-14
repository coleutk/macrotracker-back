const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const mongoose = require('mongoose');

const DailyRecord = require('../models/dailyRecord');
const ArchivedRecord = require('../models/archivedRecord'); // Assuming the schema file is named archivedRecord.js
const Food = require('../models/food');
const Drink = require('../models/drink');

router.post('/addFood', checkAuth, (req, res, next) => {
    const userId = req.userData.userId; // Hardcoded for now
    const dailyFood = {
        food: {
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            weight: {
                value: req.body.weight.value,
                unit: req.body.weight.unit
            },
            calories: req.body.calories,
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat,
            user: userId // Ensure the user field is set here
        },
        servings: req.body.servings,
    };

    DailyRecord.findOneAndUpdate(
        { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
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


router.post('/addDrink', checkAuth, (req, res, next) => {
    const userId = req.userData.userId; // Hardcoded for now
    const dailyDrink = {
        drink: {
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            volume: {
                value: req.body.volume.value,
                unit: req.body.volume.unit
            },
            calories: req.body.calories,
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat,
            user: userId // Ensure the user field is set here
        },
        servings: req.body.servings // Add the serving size here
    };

    DailyRecord.findOneAndUpdate(
        { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
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
router.post('/addManual', checkAuth, (req, res, next) => {
    const userId = req.userData.userId; // Hardcoded for now
    const dailyManual = {
        _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
        calories: req.body.calories,
        protein: req.body.protein,
        carbs: req.body.carbs,
        fat: req.body.fat,
        user: userId // Ensure the user field is set here
    };

    DailyRecord.findOneAndUpdate(
        { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
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


router.post('/resetDailyRecord', checkAuth, async (req, res, next) => {
    const userId = req.userData.userId; // Hardcoded for now

    try {
        // Find the current daily record
        const currentRecord = await DailyRecord.findOne({ user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } });

        if (!currentRecord) {
            return res.status(404).json({ message: 'No current daily record found' });
        }

        // Find or create the archived record document for the user
        let archivedRecord = await ArchivedRecord.findOne({ user: userId });
        if (!archivedRecord) {
            archivedRecord = new ArchivedRecord({
                user: userId,
                records: []
            });
        }

        // Add the current daily record to the archived records with a new unique ID
        const newArchivedRecord = currentRecord.toObject();
        newArchivedRecord._id = new mongoose.Types.ObjectId(); // Generate a new unique ID
        archivedRecord.records.push(newArchivedRecord);

        // Save the archived record
        await archivedRecord.save();

        // Reset the current daily record
        const resetRecord = await DailyRecord.findOneAndUpdate(
            { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
            { $set: { foods: [], drinks: [], manuals: [], calories: 0, protein: 0, carbs: 0, fat: 0 } },
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


router.get('/currentDailyRecord', checkAuth, (req, res, next) => {
    const userId = req.userData.userId; // Hardcoded for now
    
    DailyRecord.findOne({user: userId, date: {$gte: new Date().setHours(0, 0, 0, 0)}})
        .populate('foods')
        .populate('drinks')
        .populate('manuals')
        .select('_id user date calories protein carbs fat manuals foods drinks')
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

router.delete('/deleteFoodInput/:foodInputId', checkAuth, (req, res, next) => {
    const userId = req.userData.userId; // Use the authenticated user's ID
    const foodInputId = req.params.foodInputId;

    console.log(`User ID: ${userId}`);
    console.log(`Food Input ID: ${foodInputId}`);

    // Find the daily record for the current date
    DailyRecord.findOneAndUpdate(
        { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
        { $pull: { foods: { _id: foodInputId } } },
        { new: true }
    )
    .then(updatedRecord => {
        if (!updatedRecord) {
            console.log('No daily record found for today');
            return res.status(404).json({ message: 'No daily record found for today' });
        }

        console.log(`Updated Record: ${updatedRecord}`);

        // Calculate the updated nutritional totals from foods, drinks, and manuals
        let updatedTotals = updatedRecord.foods.reduce((totals, food) => {
            totals.calories += food.food.calories;
            totals.protein += food.food.protein;
            totals.carbs += food.food.carbs;
            totals.fat += food.food.fat;
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        updatedTotals = updatedRecord.drinks.reduce((totals, drink) => {
            totals.calories += drink.drink.calories;
            totals.protein += drink.drink.protein;
            totals.carbs += drink.drink.carbs;
            totals.fat += drink.drink.fat;
            return totals;
        }, updatedTotals);

        updatedTotals = updatedRecord.manuals.reduce((totals, manual) => {
            totals.calories += manual.calories;
            totals.protein += manual.protein;
            totals.carbs += manual.carbs;
            totals.fat += manual.fat;
            return totals;
        }, updatedTotals);

        updatedRecord.calories = updatedTotals.calories;
        updatedRecord.protein = updatedTotals.protein;
        updatedRecord.carbs = updatedTotals.carbs;
        updatedRecord.fat = updatedTotals.fat;

        return updatedRecord.save();
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



router.delete('/deleteDrinkInput/:drinkInputId', checkAuth, (req, res, next) => {
    const userId = req.userData.userId; // Use the authenticated user's ID
    const drinkInputId = req.params.drinkInputId;

    console.log(`User ID: ${userId}`);
    console.log(`Drink Input ID: ${drinkInputId}`);

    // Find the daily record for the current date
    DailyRecord.findOneAndUpdate(
        { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
        { $pull: { drinks: { _id: drinkInputId } } },
        { new: true }
    )
    .then(updatedRecord => {
        if (!updatedRecord) {
            console.log('No daily record found for today');
            return res.status(404).json({ message: 'No daily record found for today' });
        }

        console.log(`Updated Record: ${updatedRecord}`);

        // Calculate the updated nutritional totals from foods, drinks, and manuals
        let updatedTotals = updatedRecord.foods.reduce((totals, food) => {
            totals.calories += food.food.calories;
            totals.protein += food.food.protein;
            totals.carbs += food.food.carbs;
            totals.fat += food.food.fat;
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        updatedTotals = updatedRecord.drinks.reduce((totals, drink) => {
            totals.calories += drink.drink.calories;
            totals.protein += drink.drink.protein;
            totals.carbs += drink.drink.carbs;
            totals.fat += drink.drink.fat;
            return totals;
        }, updatedTotals);

        updatedTotals = updatedRecord.manuals.reduce((totals, manual) => {
            totals.calories += manual.calories;
            totals.protein += manual.protein;
            totals.carbs += manual.carbs;
            totals.fat += manual.fat;
            return totals;
        }, updatedTotals);

        updatedRecord.calories = updatedTotals.calories;
        updatedRecord.protein = updatedTotals.protein;
        updatedRecord.carbs = updatedTotals.carbs;
        updatedRecord.fat = updatedTotals.fat;

        return updatedRecord.save();
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



router.delete('/deleteManualInput/:manualInputId', checkAuth, (req, res, next) => {
    const userId = req.userData.userId; // Hardcoded for now
    const manualInputId = req.params.manualInputId;

    console.log(`User ID: ${userId}`);
    console.log(`Manual Input ID: ${manualInputId}`);

    // Find the daily record for the current date
    DailyRecord.findOneAndUpdate(
        { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
        { $pull: { manuals: { _id: manualInputId } } },
        { new: true }
    )
    .then(updatedRecord => {
        if (!updatedRecord) {
            console.log('No daily record found for today');
            return res.status(404).json({ message: 'No daily record found for today' });
        }

        // Calculate the updated nutritional totals from foods, drinks, and manuals
        let updatedTotals = updatedRecord.foods.reduce((totals, food) => {
            totals.calories += food.food.calories;
            totals.protein += food.food.protein;
            totals.carbs += food.food.carbs;
            totals.fat += food.food.fat;
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        updatedTotals = updatedRecord.drinks.reduce((totals, drink) => {
            totals.calories += drink.drink.calories;
            totals.protein += drink.drink.protein;
            totals.carbs += drink.drink.carbs;
            totals.fat += drink.drink.fat;
            return totals;
        }, updatedTotals);

        updatedTotals = updatedRecord.manuals.reduce((totals, manual) => {
            totals.calories += manual.calories;
            totals.protein += manual.protein;
            totals.carbs += manual.carbs;
            totals.fat += manual.fat;
            return totals;
        }, updatedTotals);

        updatedRecord.calories = updatedTotals.calories;
        updatedRecord.protein = updatedTotals.protein;
        updatedRecord.carbs = updatedTotals.carbs;
        updatedRecord.fat = updatedTotals.fat;

        return updatedRecord.save();
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