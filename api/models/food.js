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
    protein: {type: Number, required: false, default: 0}, // Protein per serving (g)
    carbs: {type: Number, required: false, default: 0}, // Carbohydrates per serving (g)
    fats: {type: Number, required: false, default: 0} // Fat per serving (g)
});

module.exports = mongoose.model('Food', foodSchema);