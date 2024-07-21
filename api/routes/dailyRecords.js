const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const mongoose = require('mongoose');

const DailyRecord = require('../models/dailyRecord');
const ArchivedRecord = require('../models/archivedRecord'); // Assuming the schema file is named archivedRecord.js
const User = require('../models/user'); // Ensure this line is present
const Food = require('../models/food');
const Drink = require('../models/drink');

router.post('/addFood', checkAuth, async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const user = await User.findById(userId).populate('selectedGoal');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

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
                user: userId
            },
            servings: req.body.servings,
        };

        const updatedRecord = await DailyRecord.findOneAndUpdate(
            { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
            {
                $push: { foods: dailyFood },
                $inc: {
                    calories: dailyFood.food.calories,
                    protein: dailyFood.food.protein,
                    carbs: dailyFood.food.carbs,
                    fat: dailyFood.food.fat
                },
                $setOnInsert: {
                    goal: {
                        calorieGoal: user.selectedGoal.calorieGoal,
                        proteinGoal: user.selectedGoal.proteinGoal,
                        carbGoal: user.selectedGoal.carbGoal,
                        fatGoal: user.selectedGoal.fatGoal
                    }
                }
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ updatedRecord });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});


router.post('/addDrink', checkAuth, async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const user = await User.findById(userId).populate('selectedGoal');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

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
                user: userId
            },
            servings: req.body.servings
        };

        const updatedRecord = await DailyRecord.findOneAndUpdate(
            { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
            {
                $push: { drinks: dailyDrink },
                $inc: {
                    calories: dailyDrink.drink.calories,
                    protein: dailyDrink.drink.protein,
                    carbs: dailyDrink.drink.carbs,
                    fat: dailyDrink.drink.fat
                },
                $setOnInsert: {
                    goal: {
                        calorieGoal: user.selectedGoal.calorieGoal,
                        proteinGoal: user.selectedGoal.proteinGoal,
                        carbGoal: user.selectedGoal.carbGoal,
                        fatGoal: user.selectedGoal.fatGoal
                    }
                }
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ updatedRecord });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});


// For Adding Manual Macro Info
router.post('/addManual', checkAuth, async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const user = await User.findById(userId).populate('selectedGoal');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const dailyManual = {
            _id: new mongoose.Types.ObjectId(),
            calories: req.body.calories,
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat,
            user: userId
        };

        const updatedRecord = await DailyRecord.findOneAndUpdate(
            { user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
            {
                $push: { manuals: dailyManual },
                $inc: {
                    calories: dailyManual.calories,
                    protein: dailyManual.protein,
                    carbs: dailyManual.carbs,
                    fat: dailyManual.fat
                },
                $setOnInsert: {
                    goal: {
                        calorieGoal: user.selectedGoal.calorieGoal,
                        proteinGoal: user.selectedGoal.proteinGoal,
                        carbGoal: user.selectedGoal.carbGoal,
                        fatGoal: user.selectedGoal.fatGoal
                    }
                }
            },
            { new: true, upsert: true }
        );

        //console.log(goal);
        res.status(200).json({ updatedRecord });        
    } catch (err) {
        res.status(500).json({ error: err });
    }
});



router.post('/resetDailyRecord', checkAuth, async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        console.log(`User ID: ${userId}`);

        // Fetch the latest user data
        const user = await User.findById(userId).populate('selectedGoal');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const selectedGoal = user.selectedGoal;
        if (!selectedGoal) {
            return res.status(400).json({ message: 'No selected goal found for user' });
        }

        // Find the current daily record
        const currentRecord = await DailyRecord.findOne({ user: userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } });
        if (!currentRecord) {
            console.log('No current daily record found');
            return res.status(404).json({ message: 'No current daily record found' });
        }
        console.log('Current daily record found:', currentRecord);

        // Find or create the archived record document for the user
        let archivedRecord = await ArchivedRecord.findOne({ user: userId });
        if (!archivedRecord) {
            console.log('No archived record found, creating a new one');
            archivedRecord = new ArchivedRecord({
                user: userId,
                records: []
            });
        }
        console.log('Archived record:', archivedRecord);

        // Add the current daily record to the archived records with a new unique ID
        const newArchivedRecord = currentRecord.toObject();
        newArchivedRecord._id = new mongoose.Types.ObjectId(); // Generate a new unique ID
        newArchivedRecord.goal = {
            calorieGoal: selectedGoal.calorieGoal,
            proteinGoal: selectedGoal.proteinGoal,
            carbGoal: selectedGoal.carbGoal,
            fatGoal: selectedGoal.fatGoal
        };
        archivedRecord.records.push(newArchivedRecord);

        // Save the archived record
        await archivedRecord.save();
        console.log('Archived record saved:', archivedRecord);

        // Remove the current daily record from DailyRecords collection
        await DailyRecord.deleteOne({ _id: currentRecord._id });
        console.log('Daily record removed from DailyRecords collection');

        res.status(200).json({
            message: 'Daily record archived and reset successfully',
            archivedRecord
        });
    } catch (err) {
        console.error('Error:', err);
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
        .select('_id user date calories protein carbs fat manuals foods drinks locked')
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

// Currently, we only have the ability to reset the current daily rather than
// create a new one when we want, so I will make a function that specifically 
// creates a new daily (FOR THE NEXT DAY) so we can implement this more cleanly 
// into nutrition log

// router.post('/createNextDailyRecord', checkAuth, async (req, res, next) => {
//     const userId = req.userData.userId;

//     try {
//         const user = await User.findById(userId).populate('selectedGoal');
//         if(!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         const selectedGoal = user.selectedGoal;
//         if(!selectedGoal) {
//             return res.status(400).json({ message: 'No selected goal found for user' });
//         }

//         const currentDate = new Date();
//         const nextDayDate = new Date(currentDate.setDate(currentDate.getDate() + 1));

//         const newRecord = new DailyRecord({
//             _id: new mongoose.Types.ObjectId(),
//             user: userId,
//             date: nextDayDate,
//             foods: [],
//             drinks: [],
//             manuals: [],
//             calories: 0,
//             protein: 0,
//             carbs: 0,
//             fat: 0,
//             goal: {
//                 calorieGoal: selectedGoal.calorieGoal,
//                 proteinGoal: selectedGoal.proteinGoal,
//                 carbGoal: selectedGoal.carbGoal,
//                 fatGoal: selectedGoal.fatGoal
//             },
//             locked: true // Initially locked
//         });

//         await newRecord.save();
//         console.log('New daily record created: ', newRecord);

//         res.status(201).json({
//             message: 'New daily record created successfully',
//             newRecord
//         });
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({
//             error: err.message
//         });
//     }
// });

router.post('/createNextDailyRecord', checkAuth, async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const user = await User.findById(userId).populate('selectedGoal');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const selectedGoal = user.selectedGoal;
        if (!selectedGoal) {
            return res.status(400).json({ message: 'No selected goal found for user' });
        }

        const currentDate = new Date();
        const nextDayDate = new Date(currentDate.setDate(currentDate.getDate() + 1));

        const newRecord = new DailyRecord({
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            date: nextDayDate,
            foods: [],
            drinks: [],
            manuals: [],
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            goal: {
                calorieGoal: selectedGoal.calorieGoal,
                proteinGoal: selectedGoal.proteinGoal,
                carbGoal: selectedGoal.carbGoal,
                fatGoal: selectedGoal.fatGoal
            },
            locked: true // Set the new daily record as locked
        });

        await newRecord.save();
        console.log('New daily record created: ', newRecord);

        // Set a timer to unlock the record 10 seconds after creation
        setTimeout(async () => {
            try {
                const updatedRecord = await DailyRecord.findByIdAndUpdate(
                    newRecord._id,
                    { $set: { locked: false } },
                    { new: true }
                );
                console.log('Daily record unlocked: ', updatedRecord);
            } catch (err) {
                console.error('Error unlocking daily record:', err);
            }
        }, 10000); // 10000 milliseconds = 10 seconds

        res.status(201).json({
            message: 'New daily record created successfully',
            newRecord
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;