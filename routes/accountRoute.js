// Needed Resources 
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");

// Route to deliver the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to deliver the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to deliver the registration form to the database
router.post('/register', utilities.handleErrors(accountController.registerAccount))

module.exports = router;