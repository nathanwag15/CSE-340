const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/accountValidation')

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

// Route to build registration
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to post registration
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)


module.exports = router