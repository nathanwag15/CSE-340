const utilities = require(".")
const accountModel = require("../models/account-model")
const invModel = require("../models/inventory-model")

  const { body, validationResult } = require("express-validator")
  const validate = {}


/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
     // valid email is required and cannot already exist in the database
    body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
        }
    }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}


validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required."),

        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
    
}

validate.updatePasswordRules = () => {
  return [
    body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
  ]
}

validate.checkPasswordUpdate = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      accountData: res.locals.accountData,
      body: {},
      errors: null,
      message: req.flash("notice"),
      success: req.flash("success")
  })
  }
  next()
}

validate.updateRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
     // valid email is required and cannot already exist in the database
    body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
        }
    }),
    ]
  }

validate.checkUpdateData = async (req, res, next) => {
 const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email: req.body.account_email,
      message: req.flash("notice") || null,
      success: null
    })
  }
  next()
}

validate.inventoryRules = () => {
        return [
    // classification_id is required
    body("classification_id")
        .trim()
        .notEmpty()
        .withMessage("Please select a classification."),

    // inv_make is required, min 3 chars
    body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please provide a make of at least 3 characters."),

    // inv_model is required, min 3 chars
    body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please provide a model of at least 3 characters."),

    // inv_description is required
    body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a description."),

    // inv_image: optional, but if present must be valid URL or default path
    body("inv_image")
        .trim()
        .notEmpty()
        .withMessage("Please provide an image URL."),

    // inv_thumbnail: optional, but if present must be valid URL or default path
    body("inv_thumbnail")
        .trim()
        .notEmpty()
        .withMessage("Please provide a thumbnail URL."),

    // inv_price: required, must be numeric
    body("inv_price")
        .trim()
        .notEmpty()
        .isFloat({ min: 0 })
        .withMessage("Please provide a valid price."),

    // inv_year: required, must be a 4-digit number
    body("inv_year")
        .trim()
        .notEmpty()
        .isInt({ min: 1900, max: 2099 })
        .withMessage("Please provide a valid 4-digit year."),

    // inv_miles: required, digits only
    body("inv_miles")
        .trim()
        .notEmpty()
        .isInt({ min: 0 })
        .withMessage("Please provide a valid mileage."),

    // inv_color: required
    body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a color."),
    ]

}

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const inv_id = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const result = await invModel.getClassifications()
        
    const classifications = result.rows

    // Re-render the add-item form with errors and previous data
    return res.render("inventory/add-item", {
      title: "Edit Item",
      nav,
      classifications, // or fetch again if not stored
      errors: validationResult(req), // array of validation errors
      data: req.body,         // so the form keeps user input
      message: req.flash("message"),
      inv_id
    })
  }

  next()
}

/***********      
 * Errors will be directed back to the edit view
 ***********/

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const result = await invModel.getClassifications()
        
    const classifications = result.rows

    // Re-render the add-item form with errors and previous data
    return res.render("inventory/add-item", {
      title: "Add Inventory Item",
      nav,
      classifications, // or fetch again if not stored
      errors: validationResult(req), // array of validation errors
      data: req.body,         // so the form keeps user input
      message: req.flash("message")
    })
  }

  next()
}

module.exports = validate