const mongoose = require('mongoose');

const { foodSchema } = require('../models/food');
const { drinkSchema } = require('../models/drink');
const { manualSchema } = require('../models/manual')

const dailyFoodSchema = new mongoose.Schema({
    food: { type: foodSchema, required: true },
    servings: { type: Number, required: true } // Add the serving size here
});

const dailyDrinkSchema = new mongoose.Schema({
    drink: { type: drinkSchema, required: true },
    servings: { type: Number, required: true } // Add the serving size here
});

const dailyRecordSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now, required: true },
    manuals: [manualSchema],
    foods: [dailyFoodSchema], // Array of food entries
    drinks: [dailyDrinkSchema], // Array of drink entries
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: null, required: false },
    fat: { type: Number, default: null, required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { // Add goal field here
        calorieGoal: { type: Number, required: true },
        proteinGoal: { type: Number, required: true },
        carbGoal: { type: Number, required: true },
        fatGoal: { type: Number, required: true }
    }
});

module.exports = mongoose.model('DailyRecord', dailyRecordSchema);
module.exports.dailyRecordSchema = dailyRecordSchema; // Exporting the schema as well
