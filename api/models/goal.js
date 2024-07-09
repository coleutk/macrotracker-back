const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true}, // Name of personal goal
    calorieGoal: {type: Number, required: true}, // Desired calorie intake
    proteinGoal: {type: Number, required: true}, // Desired protein intake
    carbGoal: {type: Number, required: false, default: 0}, // Desired carb intake
    fatGoal: {type: Number, required: false, default: 0}, // Desired fat intake
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Add user reference
});

module.exports = mongoose.model('Goal', goalSchema);