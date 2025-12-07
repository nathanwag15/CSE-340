const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: req.flash("notice"),  // messages from registration
    success: req.flash("success")
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()

  res.render("account/", {
    title: "Management",
    nav,
    errors: null,
    success: null,
    message: null,
    accountData: res.locals.accountData // ✅ pass JWT data to view
  })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors : null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.redirect("/account/login") // <-- redirect reads flash in the next request
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,

    })
  }
}



/* ****************************************  
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
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

      // Store user in session for EJS/header
      req.session.accountData = accountData

      const accessToken = jwt.sign(
        accountData, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: 3600 * 1000 }
      )

      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        message: req.flash("notice"),  // pull flash messages
        success: null                  // define success to prevent crash
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/****************************************
 *  Account Logout
 ***************************************/
async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("success", "You have been logged out.")
  return res.redirect("/")
}

/****************************************
 *  Deliver account update view
 ****************************************/
async function buildUpdateView(req, res, next) {
  const nav = await utilities.getNav()
  
  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData: res.locals.accountData,
    errors: null,
    message: req.flash("notice"),
    success: req.flash("success")
  })
}

/****************************************
 *  Update account information
 ****************************************/
async function updateAccountInfo(req, res, next) {
  const nav = await utilities.getNav()
  // const errors = validationResult(req)
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  try {
    await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
    req.flash("success", "Account information updated successfully.")
    
    // Update session or JWT data if needed
    res.locals.accountData.account_firstname = account_firstname
    res.locals.accountData.account_lastname = account_lastname
    res.locals.accountData.account_email = account_email
    
    res.locals.accountData.account_firstname = account_firstname
    res.locals.accountData.account_lastname = account_lastname
    res.locals.accountData.account_email = account_email

    // If using sessions:
    req.session.accountData = res.locals.accountData

    // If using JWT:
    const accessToken = jwt.sign(
      res.locals.accountData,
      process.env.ACCESS_TOKEN_SECRET
    )

    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

      res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: res.locals.accountData,
        errors: null,
        message: req.flash("notice"),
        success: req.flash("success")
      })

  } catch (error) {
    req.flash("notice", "Error updating account. Please try again.")
    
  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData: res.locals.accountData,
    errors: null,
    message: req.flash("notice"),
    success: req.flash("success")
  })
  }
}

/****************************************
 *  Update account password
 ****************************************/
async function updateAccountPassword(req, res, next) {
  const nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10)
    await accountModel.updatePassword(account_id, hashedPassword)
    req.flash("success", "Password updated successfully.")
    res.render("account/update", {
      title: "Update Account",
      nav,
      accountData: res.locals.accountData,
      errors: null,
      message: req.flash("notice"),
      success: req.flash("success")
  })
  } catch (error) {
    req.flash("notice", "Error updating password. Please try again.")
    return res.render("account/update", {
      title: "Update Account",
      nav,
      accountData: res.locals.accountData,
      errors: null,
      message: req.flash("notice"),
      success: null
    })
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, accountLogout,  buildUpdateView,
  updateAccountInfo,
  updateAccountPassword} 