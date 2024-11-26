// Needed Resources 
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");

// Route to deliver the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

module.exports = router;