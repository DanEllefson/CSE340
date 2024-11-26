const utilities = require("../utilities/");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    // Add a test flash message
    req.flash("notice", "Welcome! Please log in to your account.");
    res.render("account/login", {
      title: "Login",
      nav,
    });
}

module.exports = { buildLogin };