const mongoose = require('mongoose');

const foodSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true}, // Name of food
    weight: {
        value: {type: Number, required: true}, // Weight per serving
        unit: {
            type: String,
            required: true,
            enum: ['g', 'kg', 'mg', 'oz', 'lb'], // Allowed units
            default: 'g'
        }
    },
    calories: {type: Number, required: true}, // Calories per serving
    protein: {type: Number, required: true, default: 0}, // Protein per serving (g)
    carbs: {type: Number, required: false, default: null}, // Carbohydrates per serving (g)
    fat: {type: Number, required: false, default: null}, // Fat per serving (g)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Add user reference
});

module.exports = mongoose.model('Food', foodSchema);
module.exports.foodSchema = foodSchema; // Exporting the schema as well