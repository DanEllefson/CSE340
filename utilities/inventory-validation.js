const { body, validationResult } = require("express-validator");
const utilities = require("./");
const invModel = require("../models/inventory-model");
const inventoryValidate = {};

/*************************************
 *  Add Classification Validation Rules
 **************************************/
inventoryValidate.addClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isAlphanumeric()
      .withMessage("Classification name must be alphanumeric without spaces or special characters."),
  ];
};

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
inventoryValidate.checkAddClassification = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors: errors.array(),
      title: "Add Classification",
      nav,
      messages: req.flash("notice"),
      classification_name,
    });
    return;
  }
  next();
};

module.exports = inventoryValidate;