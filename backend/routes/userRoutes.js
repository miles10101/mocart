// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers, createUser } = require('../controllers/userController'); // Ensure correct import

router.get('/', getAllUsers); // Correctly reference getAllUsers
router.post('/', createUser); // Correctly reference createUser

module.exports = router;
