const mongoose = require('mongoose');

const ArchivedRecord = require('../models/archivedRecord'); // Adjust path as needed

exports.archived_get_all = (req, res, next) => {
    const userId = req.userData.userId; // Hardcoded for now

    ArchivedRecord.findOne({ user: userId })
        .then(archivedRecords => {
            if (!archivedRecords) {
                console.log("not found");
                return res.status(404).json({ message: 'No archived records found for this user' });
            }
            //console.log("Archived records found:", archivedRecords);
            res.status(200).json(archivedRecords);
        })
        .catch(err => {
            console.log("Error:", err.message);
            res.status(500).json({ error: err.message });
        });
}

exports.archived_delete_record = async (req, res) => {
    const userId = req.userData.userId;
    const { date } = req.body;

    console.log('Received date:', date); // Log the received date
    console.log('Request body:', req.body); // Log the entire request body for debugging

    try {
        const result = await ArchivedRecord.findOneAndUpdate(
            { user: userId },
            { $pull: { records: { date: date } } },
            { new: true }
        );

        if (result) {
            const recordDeleted = result.records.some(record => record.date === date);
            if (!recordDeleted) {
                res.status(200).json({ message: 'Archived record deleted successfully' });
            } else {
                res.status(404).json({ message: 'No record found for the given date' });
            }
        } else {
            res.status(404).json({ message: 'No record found for the given user' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}