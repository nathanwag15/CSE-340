const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}




/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="/inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ************************************
 * Build the Details view HTML
 * ********************************** */

Util.buildDetailsGrid = async function(data){
  if (!data) return '<p class="notice">Sorry, vehicle not found.</p>'

  let grid = '<div id="inv-detail-display">'

  grid += `
    <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
    <div class="inv-detail-container">
      <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}">
      <ul>
        <li><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(data.inv_price)}</li>
        <li><strong>Miles:</strong> ${data.inv_miles}</li>
        <li><strong>Color:</strong> ${data.inv_color}</li>
        <li><strong>Description:</strong> ${data.inv_description}</li>
      </ul>
    </div>
  `

  grid += '</div>'
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


function checkEmployee(req, res, next) {
  const token = req.cookies.jwt
  let nav = getNav()

  if (!token) {
    req.flash("notice", "Please log in with an Employee or Admin account.")
    return res.status(401).render("account/login", {
      title: "Login",
      errors: null,
      nav: nav,
      message: req.flash("notice")
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const role = decoded.account_type

    if (role === "Employee" || role === "Admin") {
      res.locals.accountData = decoded
      return next()
    } else {
      req.flash("notice", "You are not authorized to access that area.")
      return res.status(403).render("account/login", {
        title: "Login",
        errors: null,
        nav: nav,
        message: req.flash("notice")
      })
    }
  } catch (err) {
    req.flash("notice", "Your session has expired. Please log in again.")
    return res.status(403).render("account/login", {
      title: "Login",
      errors: null,
      nav: nav,
      message: req.flash("notice")
    })
  }
}

module.exports = Util