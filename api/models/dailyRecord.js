const mongoose = require('mongoose');

const dailyRecordSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now, required: true },
    foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
    drinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Drink' }],
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 }
});

module.exports = mongoose.model('DailyRecord', dailyRecordSchema);
