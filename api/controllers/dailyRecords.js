const mongoose = require('mongoose');

const DailyRecord = require('../models/dailyRecord');
const ArchivedRecord = require('../models/archivedRecord'); // Assuming the schema file is named archivedRecord.js
const User = require('../models/user'); // Ensure this line is present

exports.daily_add_food = async (req, res, next) => {
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
            { user: userId },
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
}

exports.daily_add_drink = async (req, res, next) => {
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
            { user: userId },
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
}

exports.daily_add_manual = async (req, res, next) => {
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
            { user: userId },
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
}

exports.daily_complete_day = async (req, res, next) => {
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

        const currentRecord = await DailyRecord.findOne({ user: userId });
        if (!currentRecord) {
            return res.status(404).json({ message: 'No current daily record found' });
        }

        let archivedRecord = await ArchivedRecord.findOne({ user: userId });
        if (!archivedRecord) {
            archivedRecord = new ArchivedRecord({
                user: userId,
                records: []
            });
        }

        const newArchivedRecord = currentRecord.toObject();
        newArchivedRecord._id = new mongoose.Types.ObjectId();
        newArchivedRecord.goal = {
            calorieGoal: selectedGoal.calorieGoal,
            proteinGoal: selectedGoal.proteinGoal,
            carbGoal: selectedGoal.carbGoal,
            fatGoal: selectedGoal.fatGoal
        };
        archivedRecord.records.push(newArchivedRecord);
        await archivedRecord.save();
        await DailyRecord.deleteOne({ _id: currentRecord._id });

        // Calculate the next day date by adding one day to the current record date
        const nextDayDate = new Date(currentRecord.date.getTime() + 24 * 60 * 60 * 1000);

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
            }
        });

        await newRecord.save();

        res.status(200).json({
            message: 'Day completed and new daily record created successfully',
            newRecord: newRecord.toObject({ versionKey: false }) // Exclude __v
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: err.message
        });
    }
};

exports.daily_get_current_record = async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        let currentRecord = await DailyRecord.findOne({ user: userId })
            .populate('foods')
            .populate('drinks')
            .populate('manuals')
            .select('_id user date calories protein carbs fat manuals foods drinks');

        if (!currentRecord) {
            // Create a new daily record if it doesn't exist
            const user = await User.findById(userId).populate('selectedGoal');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const selectedGoal = user.selectedGoal;
            if (!selectedGoal) {
                return res.status(400).json({ message: 'No selected goal found for user' });
            }

            const newRecord = new DailyRecord({
                _id: new mongoose.Types.ObjectId(),
                user: userId,
                date: new Date(),
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
                }
            });

            await newRecord.save();
            currentRecord = newRecord;
            console.log('New daily record created: ', newRecord);
        }

        res.status(200).json(currentRecord);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};


exports.daily_delete_food_input = (req, res, next) => {
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
}

exports.daily_delete_drink_input = (req, res, next) => {
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
}

exports.daily_delete_manual_input = (req, res, next) => {
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
}