const express = require('express');
const router = express.Router();

const UserController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

router.post('/signup', UserController.user_signup);

router.post('/login', UserController.user_login);

router.delete('/:userId', checkAuth, UserController.user_delete);

// Note that if Auth is failing, you have to either sign up or sign in to a user
// and fetch that specific token to put in front of "Bearer "
// Then the auth should pass

module.exports = router;