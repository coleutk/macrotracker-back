const mongoose = require('mongoose');

const drinkSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true}, // Name of drink
    volume: {
        value: {type: Number, required: true}, // Volume per serving
        unit: {
            type: String,
            required: true,
            enum: ['mL', 'L', 'c', 'oz'], // Allowed units
            default: 'mL'
        }
    },
    calories: {type: Number, required: true}, // Calories per serving
    protein: {type: Number, required: false, default: 0}, // Protein per serving (g)
    carbs: {type: Number, required: false, default: 0}, // Carbohydrates per serving (g)
    fat: {type: Number, required: false, default: 0}, // Fat per serving (g)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Add user reference
});

// Drink Schema
module.exports = mongoose.model('Drink', drinkSchema);
module.exports.drinkSchema = drinkSchema; // Exporting the schema as well