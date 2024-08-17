const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Goal = require('../models/goal');

const { check, validationResult } = require('express-validator');

// Validation middleware
const userSignupValidationRules = [
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

exports.user_signup = [
    userSignupValidationRules,
    async (req, res, next) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check if the email already exists
            const existingEmailUser = await User.findOne({ email: req.body.email }).exec();
            if (existingEmailUser) {
                return res.status(409).json({
                    message: 'E-Mail exists'
                });
            }

            // Check if the username already exists
            const existingUsernameUser = await User.findOne({ username: req.body.username }).exec();
            if (existingUsernameUser) {
                return res.status(409).json({
                    message: 'Username exists'
                });
            }

            // Hash the password
            const hash = await bcrypt.hash(req.body.password, 10);

            // Create a new user
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                username: req.body.username,
                email: req.body.email,
                password: hash
            });

            // Save the user to the database
            const result = await user.save();
            console.log(result);

            res.status(201).json({
                message: 'User created'
            });

        } catch (err) {
            console.log('Error during user signup:', err);
            res.status(500).json({
                error: err.message || 'Internal server error'
            });
        }
    }
];


exports.user_login = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }

                if(result) {
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "30d"
                    });

                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }

                return res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        }); 
}

exports.user_delete = (req, res, next) => {
    User.deleteOne({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

// Mainly for retreiving selected goal
exports.get_user_details = (req, res, next) => {
    const userId = req.userData.userId;

    User.findById(userId)
        .select('username email selectedGoal') // Select only the necessary fields
        .populate('selectedGoal') // Populate the selectedGoal field with goal details
        .exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }
            res.status(200).json({
                user: user
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

exports.update_user_details = async (req, res, next) => {
    const userId = req.userData.userId;
    const { username, email } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { username, email }, {new: true});

        if(!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update user',
            error: error.message
        });
    }
}

exports.update_password = async (req, res, next) => {
    const userId = req.userData.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        bcrypt.hash(newPassword, 10, async (err, hash) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            user.password = hash;
            await user.save();

            res.status(200).json({ message: "Password updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update password", error: error.message });
    }
}

