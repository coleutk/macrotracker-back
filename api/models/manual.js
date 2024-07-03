const mongoose = require('mongoose');

const manualSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    calories: {type: Number, required: true}, // Calories per serving
    protein: {type: Number, required: false, default: 0}, // Protein per serving (g)
    carbs: {type: Number, required: false, default: 0}, // Carbohydrates per serving (g)
    fat: {type: Number, required: false, default: 0} // Fat per serving (g)
});

module.exports = mongoose.model('Manual', manualSchema);
module.exports.manualSchema = manualSchema; // Exporting the schema as well