const utilities = require("../utilities/index")
const favoritesModel = require("../models/favorites-model")
const invModel = require("../models/inventory-model")

const favCont = {}


/****************************************
 * Add favorite
 ****************************************/
favCont.addFavorite = async function addFavorite(req, res) {
  const { inv_id } = req.body
  const account_id = res.locals.accountData.account_id

  await favoritesModel.addFavorite(account_id, inv_id)
  req.flash("success", "Added to favorites.")
  const data = await invModel.getDetailsByInventoryId(inv_id)
  const grid = await utilities.buildDetailsGrid(data)
  let nav = await utilities.getNav()
  const vehicleYear = data.inv_year
  const vehicleModel = data.inv_model
  const vehicleMake = data.inv_make

  let favorite = false
      if (res.locals.accountData) {
        favorite = await favoritesModel.isFavorite(res.locals.accountData.account_id, inv_id)
      }

  res.render(`inventory/detail`, {
    title: vehicleYear + " " +vehicleMake + " " + vehicleModel , 
    nav, 
    grid,
    item: data,
    favorite
  })
}

/****************************************
 * Remove favorite
 ****************************************/
favCont.removeFavorite = async function removeFavorite(req, res) {
  const { inv_id } = req.body
  const account_id = res.locals.accountData.account_id

  await favoritesModel.removeFavorite(account_id, inv_id)
  req.flash("success", "Added to favorites.")
  const data = await invModel.getDetailsByInventoryId(inv_id)
  const grid = await utilities.buildDetailsGrid(data)
  let nav = await utilities.getNav()
  const vehicleYear = data.inv_year
  const vehicleModel = data.inv_model
  const vehicleMake = data.inv_make

  let favorite = false
      if (res.locals.accountData) {
        favorite = await favoritesModel.isFavorite(res.locals.accountData.account_id, inv_id)
      }

  res.render(`inventory/detail`, {
    title: vehicleYear + " " +vehicleMake + " " + vehicleModel , 
    nav, 
    grid,
    item: data,
    favorite
  })
}




/* ******************************
 * Build inventory by classification view
 * ***************************** */
favCont.buildByAccountId = async function (req, res, next) {
    const account_id = res.locals.accountData.account_id
    const data = await favoritesModel.getFavoritesByAccountId(account_id)
    console.log(data)
    const grid = await utilities.buildFavoritesGrid(data)
    let nav = await utilities.getNav()
    res.render("./favorites", {
        title: "Favorited vehicles",
        nav,
        grid,
    })
}



module.exports = favCont