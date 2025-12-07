const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/accountValidation")

// account management router
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Process the logout
router.get("/logout", accountController.accountLogout)

// update the user information
router.get("/update/:account_id", accountController.accountUpdate)

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