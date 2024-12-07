const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

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
      errors: null,
    });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    firstName: req.body?.firstName || '',
    lastName: req.body?.lastName || '',
    email: req.body?.email || '',
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null, // Pass null to avoid undefined errors
      account_email: "", // Clear the email field
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Invalid email or password. Please try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const clientName = accountData.account_firstname
      const account_type = accountData.account_type
      const accessToken = jwt.sign(
        { clientName, account_type, ...accountData }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: 3600 }
      )
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Invalid password. Please try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildAccountManagementView(req, res) {
  try {
    const nav = await utilities.getNav();
    const { account_type = "Client", account_firstname = "User" } = req.accountData || {};

    const inventoryManagement =
      account_type === "Employee" || account_type === "Admin"
        ? { showInventoryManagement: true, inventoryLink: "/inv/" }
        : { showInventoryManagement: false };

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      messages: req.flash.bind(req),
      errors: null,
      accountData: req.accountData || null,
      inventoryManagement,
    });
  } catch (error) {
    console.error("Error rendering Account Management View:", error.message);
    throw new Error("Error rendering Account Management View");
  }
}

/* ****************************************
 *  Deliver Update Account View
 * ************************************ */
async function buildUpdateAccountView(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } =
    req.accountData || {};

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    messages: req.flash.bind(req),
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  });
}

/* ****************************************
 *  Process Update Account Form
 * ************************************ */
async function processUpdateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );

  if (updateResult) {
    req.flash(
      "notice",
      `Account successfully updated for ${account_firstname} ${account_lastname}.`
    );
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Account update failed. Please try again.");
    return buildUpdateAccountView(req, res);
  }
}

/* ****************************************
 *  Process Update Password Form
 * ************************************ */
async function processUpdatePassword(req, res) {
  const { account_password, account_id } = req.body;

  // Validate and hash the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Password update failed. Please try again.");
    return buildUpdateAccountView(req, res);
  }

  const passwordResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  );

  if (passwordResult) {
    req.flash("notice", "Password successfully updated.");
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Password update failed. Please try again.");
    return buildUpdateAccountView(req, res);
  }
}

/* ****************************************
 *  Deliver Update Account View
 * ************************************ */
async function getUpdateAccountView(req, res, next) {
  const account_id = parseInt(req.params.id, 10);
  if (!account_id) {
    req.flash("error", "Invalid account ID.");
    return res.status(404).render("error", { title: "Error 404", message: "Invalid account ID." });
  }

  try {
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) {
      return res.status(404).render("error", { title: "Error 404", message: "Account not found." });
    }
    let nav = await utilities.getNav();
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      errors: null,
      messages: req.flash.bind(req),
    });
  } catch (err) {
    console.error("Error fetching account data:", err);
    next(err);
  }
};

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, 
                   buildAccountManagementView, buildUpdateAccountView, processUpdateAccount, processUpdatePassword, getUpdateAccountView };