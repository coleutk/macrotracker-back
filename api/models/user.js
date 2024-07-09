const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {type: String, required: true, unique: true},
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {type: String, required: true},
    selectedGoal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null }, // Default to null
    dailyRecords: [{type: mongoose.Schema.Types.ObjectId, ref: 'DailyRecord'}] // Daily Tracked Amounts
});

module.exports = mongoose.model('User', userSchema);