const express = require('express');
const router = express.Router();
const ArchivedRecord = require('../models/archivedRecord'); // Adjust path as needed

const mongoose = require('mongoose');

// Get all archived records for a user
router.get('/', (req, res, next) => {
    const userId = '6653b47937963eb408615abc'; // Hardcoded for now

    ArchivedRecord.findOne({ userId: userId })
        .then(archivedRecords => {
            if (!archivedRecords) {
                console.log("not found");
                return res.status(404).json({ message: 'No archived records found for this user' });
            }
            console.log("Archived records found:", archivedRecords);
            res.status(200).json(archivedRecords);
        })
        .catch(err => {
            console.log("Error:", err.message);
            res.status(500).json({ error: err.message });
        });
});

module.exports = router;
