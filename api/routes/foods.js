const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const FoodsController = require('../controllers/foods');

// Get all Foods
router.get('/', FoodsController.foods_get_all);

// Add new Food
/* Template for JSON raw body:
{
    "name": "Apple",
    "weight": {
        "value": 150,
        "unit": "g"
    },
    "calories": 52,
    "protein": 0.3,
    "carbs": 26,
    "fat": 0.2
}
*/
router.post('/', FoodsController.foods_create_food);

// Get Food by Id
router.get('/:foodId', checkAuth, FoodsController.foods_get_food);

// Update Food attribute(s)
/* Template for JSON raw body:
[
    { "propName": "name", "value": "New Food Name" },
    { "propName": "calories", "value": 500 }
]
*/

/* To change 'unit' WITHIN 'weight' for example:
[
    { "propName": "weight.value", "value": 500 },
    { "propName": "weight.unit", "value": "g" }
]
*/
router.patch('/:foodId', FoodsController.foods_update_food);

// Delete Food
router.delete('/:foodId', FoodsController.foods_delete_food);


module.exports = router;

