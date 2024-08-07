const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const archivedRecordsController = require('../controllers/archivedRecords')

// Get All Archived Records for a User
router.get('/', checkAuth, archivedRecordsController.archived_get_all);

// Get a specific Archived Record by ID
router.get('/:recordId', checkAuth, archivedRecordsController.archived_get_record_by_id);

// Delete Food from Archived Record
router.delete('/deleteFood/:recordId/:foodInputId', checkAuth, archivedRecordsController.archived_delete_food);

// // Delete Drink from Archived Record
// router.delete('/deleteDrink/:recordId/:drinkInputId', checkAuth, archivedRecordsController.archived_delete_drink);

// // Delete Manual Entry from Archived Record
// router.delete('/deleteManual/:recordId/:manualInputId', checkAuth, archivedRecordsController.archived_delete_manual);

// // Add Food to Archived Record
// router.post('/addFood/:recordId', checkAuth, archivedRecordsController.archived_add_food);

// // Add Drink to Archived Record
// router.post('/addDrink/:recordId', checkAuth, archivedRecordsController.archived_add_drink);

// // Add Manual Entry to Archived Record
// router.post('/addManual/:recordId', checkAuth, archivedRecordsController.archived_add_manual);

// Delete Specified Archived Record
router.delete('/deleteArchivedRecord', checkAuth, archivedRecordsController.archived_delete_record);

module.exports = router;
