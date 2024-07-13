const mongoose = require('mongoose');
const { dailyRecordSchema } = require('../models/dailyRecord'); // Import the dailyRecord schema

const archivedRecordSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    records: [dailyRecordSchema] // Array of daily records
});

module.exports = mongoose.model('ArchivedRecord', archivedRecordSchema);
