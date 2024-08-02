const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./api/routes/users');
const foodRoutes = require('./api/routes/foods');
const drinkRoutes = require('./api/routes/drinks');
const goalsRoutes = require('./api/routes/goals');
const goalRoutes = require('./api/routes/goal');
const dailyRecordRoutes = require('./api/routes/dailyRecords');
const archivedRecordRoutes = require('./api/routes/archivedRecords');

mongoose.connect(
    'mongodb+srv://cratik:' + process.env.MONGO_ATLAS_PW + '@cluster0.j3iiz2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
);

// Test connection (can remove)
mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected');
});

mongoose.Promise = global.Promise;

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads')); // making uploads folder available to everyone
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT', 'POST', 'PATCH', 'DELETE', 'GET');
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests
app.use('/users', userRoutes);
app.use('/foods', foodRoutes);
app.use('/drinks', drinkRoutes);
app.use('/goals', goalsRoutes);
app.use('/goal', goalRoutes);
app.use('/dailyRecords', dailyRecordRoutes);
app.use('/archivedRecords', archivedRecordRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;