const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const dailyRecordsController = require('../controllers/dailyRecords')

// Add Food to Daily Input (from Inventory)
router.post('/addFood', checkAuth, dailyRecordsController.daily_add_food);

// Add Drink to Daily Input (from Inventory)
router.post('/addDrink', checkAuth, dailyRecordsController.daily_add_drink);

// Add Manual Entry to Daily Input
router.post('/addManual', checkAuth, dailyRecordsController.daily_add_manual);

// End Current Day + Generate Next
router.post('/completeDay', checkAuth, dailyRecordsController.daily_complete_day);

// Get Current Daily Record for Nutrition Log
router.get('/currentDailyRecord', checkAuth, dailyRecordsController.daily_get_current_record);

// Delete Food from Daily Input
router.delete('/deleteFoodInput/:foodInputId', checkAuth, dailyRecordsController.daily_delete_food_input);

// Delete Drink from Daily Input
router.delete('/deleteDrinkInput/:drinkInputId', checkAuth, dailyRecordsController.daily_delete_drink_input);

// Delete Manual Entry from Daily Input
router.delete('/deleteManualInput/:manualInputId', checkAuth, dailyRecordsController.daily_delete_manual_input);

// Automatically Create New Daily Record (If archivedRecords + dailyRecords is Empty)
router.post('/initializeDailyRecordIfEmpty', checkAuth, dailyRecordsController.daily_initialize_if_empty);

// Unlocks Current Daily Record when Real Time Date Aligns with Locked Day Date
router.post('/unlockCurrentDailyRecord', checkAuth, dailyRecordsController.daily_unlock_current);

module.exports = router;