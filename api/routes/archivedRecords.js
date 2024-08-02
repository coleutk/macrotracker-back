const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const archivedRecordsController = require('../controllers/archivedRecords')

// Get All Archived Records for a User
router.get('/', checkAuth, archivedRecordsController.archived_get_all);

// Delete Specified Archived Record
router.delete('/deleteArchivedRecord', checkAuth, archivedRecordsController.archived_delete_record);

module.exports = router;
