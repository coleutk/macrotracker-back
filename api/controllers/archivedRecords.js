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

exports.archived_get_record_by_id = async (req, res) => {
    const userId = req.userData.userId;
    const { recordId } = req.params;

    try {
        // Find the specific record by ID within the user's archived records
        const archivedRecords = await ArchivedRecord.findOne(
            { user: userId, "records._id": recordId },
            { "records.$": 1 } // Project only the matching record
        );

        if (!archivedRecords || archivedRecords.records.length === 0) {
            return res.status(404).json({ message: 'No record found for the given ID' });
        }

        const record = archivedRecords.records[0];
        res.status(200).json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.archived_delete_food = async (req, res) => {
    const userId = req.userData.userId;
    const { recordId, foodInputId } = req.params;

    try {
        const result = await ArchivedRecord.findOneAndUpdate(
            { user: userId, "records._id": recordId },
            { $pull: { "records.$.foods": { _id: foodInputId } } },
            { new: true }
        );

        if (result) {
            // Recalculate nutritional totals
            const record = result.records.id(recordId);
            const updatedTotals = calculateNutritionalTotals(record);

            record.calories = updatedTotals.calories;
            record.protein = updatedTotals.protein;
            record.carbs = updatedTotals.carbs;
            record.fat = updatedTotals.fat;

            await result.save();

            res.status(200).json({ message: 'Food entry deleted successfully', updatedRecord: record });
        } else {
            res.status(404).json({ message: 'No record found for the given ID' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.archived_delete_drink = async (req, res) => {
    const userId = req.userData.userId;
    const { recordId, drinkInputId } = req.params;

    try {
        const result = await ArchivedRecord.findOneAndUpdate(
            { user: userId, "records._id": recordId },
            { $pull: { "records.$.drinks": { _id: drinkInputId } } },
            { new: true }
        );

        if (result) {
            // Recalculate nutritional totals
            const record = result.records.id(recordId);
            const updatedTotals = calculateNutritionalTotals(record);

            record.calories = updatedTotals.calories;
            record.protein = updatedTotals.protein;
            record.carbs = updatedTotals.carbs;
            record.fat = updatedTotals.fat;

            await result.save();

            res.status(200).json({ message: 'Drink entry deleted successfully', updatedRecord: record });
        } else {
            res.status(404).json({ message: 'No record found for the given ID' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.archived_delete_manual = async (req, res) => {
    const userId = req.userData.userId;
    const { recordId, manualInputId } = req.params;

    try {
        const result = await ArchivedRecord.findOneAndUpdate(
            { user: userId, "records._id": recordId },
            { $pull: { "records.$.manuals": { _id: manualInputId } } },
            { new: true }
        );

        if (result) {
            // Recalculate nutritional totals
            const record = result.records.id(recordId);
            const updatedTotals = calculateNutritionalTotals(record);

            record.calories = updatedTotals.calories;
            record.protein = updatedTotals.protein;
            record.carbs = updatedTotals.carbs;
            record.fat = updatedTotals.fat;

            await result.save();

            res.status(200).json({ message: 'Manual entry deleted successfully', updatedRecord: record });
        } else {
            res.status(404).json({ message: 'No record found for the given ID' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Function to calculate nutritional totals
function calculateNutritionalTotals(record) {
    let totals = record.foods.reduce((totals, food) => {
        totals.calories += food.food.calories;
        totals.protein += food.food.protein;
        totals.carbs += food.food.carbs;
        totals.fat += food.food.fat;
        return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    totals = record.drinks.reduce((totals, drink) => {
        totals.calories += drink.drink.calories;
        totals.protein += drink.drink.protein;
        totals.carbs += drink.drink.carbs;
        totals.fat += drink.drink.fat;
        return totals;
    }, totals);

    totals = record.manuals.reduce((totals, manual) => {
        totals.calories += manual.calories;
        totals.protein += manual.protein;
        totals.carbs += manual.carbs;
        totals.fat += manual.fat;
        return totals;
    }, totals);

    return totals;
};



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
};