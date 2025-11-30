const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ******************************
 * Build inventory by classification view
 * ***************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}



invCont.buildByInvId = async function (req, res, next){
    const invId = req.params.invId
    const data = await invModel.getDetailsByInventoryId(invId)
    const grid = await utilities.buildDetailsGrid(data)
    let nav = await utilities.getNav()
    const vehicleYear = data.inv_year
    const vehicleModel = data.inv_model
    const vehicleMake = data.inv_make

    console.log(grid)
    res.render(`inventory/detail`, {
        title: vehicleYear + " " +vehicleMake + " " + vehicleModel , 
        nav, 
        grid,
        item: data
    })

} 


/* ****************************************
*  Render Add Inventory View
* *************************************** */
invCont.renderAddItemView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const result = await invModel.getClassifications()
    const classifications = result.rows

    res.render("inventory/add-item", { 
      title: "Add Inventory Item",
      nav,
      classifications,
      message: req.flash("message"), // for optional flash display in view
      data: null
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
*  Add Inventory Item
* *************************************** */
invCont.addInventoryItem = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()

    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    } = req.body

    // Call model to insert new inventory item
    const regResult = await invModel.addInventoryItem(
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    )

    // ✅ Proper success check (make sure rows exist)
    if (regResult && regResult.rows && regResult.rows[0]) {
      req.flash("message", `Inventory item added successfully: ${inv_year} ${inv_make} ${inv_model}`)
      return res.redirect("/inv/addItem") // redirect to avoid duplicate submission
    } else {
      req.flash("message", "Sorry, adding the inventory item failed.")
      res.status(501).render("inv/addItem", {
        title: "Add Inventory Item",
        nav,
        message: req.flash("message"),
        data: req.body
      })
    }
  } catch (err) {
    next(err) // ✅ lets middleware handle errors
  }
}


module.exports = invCont