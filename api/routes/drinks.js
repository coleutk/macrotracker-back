const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const DrinksController = require('../controllers/drinks');

// Get all Drinks
router.get('/', checkAuth, DrinksController.drinks_get_all);

// Add new Drink
/* Template for JSON raw body:
{
    "name": "Drink",
    "volume": {
        "value": 150,
        "unit": "fl oz"
    },
    "calories": 52,
    "protein": 0.3,
    "carbs": 26,
    "fat": 0.2
}
*/
router.post('/', checkAuth, DrinksController.drinks_create_drink);

// Get Drink by id
router.get('/:drinkId', checkAuth, DrinksController.drinks_get_drink);

// Update Drink attribute(s)
/* Template for JSON raw body:
[
    { "propName": "name", "value": "New Drink Name" },
    { "propName": "calories", "value": 500 }
]
*/

/* To change 'unit' WITHIN 'volume' for example:
[
    { "propName": "volume.value", "value": 500 },
    { "propName": "volume.unit", "value": "ml" }
]
*/
router.patch('/:drinkId', checkAuth, DrinksController.drinks_update_drink);

// Delete Drink
router.delete('/:drinkId', checkAuth, DrinksController.drinks_delete_drink);


module.exports = router;

