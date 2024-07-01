const mongoose = require('mongoose');

const { foodSchema } = require('../models/food');
const { drinkSchema } = require('../models/drink');

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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now, required: true },
    // foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
    // drinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Drink' }],
    foods: [dailyFoodSchema], // Array of food entries
    drinks: [dailyDrinkSchema], // Array of drink entries
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
});

module.exports = mongoose.model('DailyRecord', dailyRecordSchema);
module.exports.dailyRecordSchema = dailyRecordSchema; // Exporting the schema as well
