const mongoose = require('mongoose');

const { foodSchema } = require('../models/food');
const { drinkSchema } = require('../models/drink');

const dailyRecordSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now, required: true },
    // foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
    // drinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Drink' }],
    foods: [foodSchema], // Array of food entries
    drinks: [drinkSchema], // Array of drink entries
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
});

module.exports = mongoose.model('DailyRecord', dailyRecordSchema);
