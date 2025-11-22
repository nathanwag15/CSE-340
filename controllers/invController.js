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

module.exports = invCont

const invDetails = {}

invDetails.buildByInvId = async function (req, res, next){
    const inventory_id = req.params.invId
    const data = await invModel.getDetailsByInventoryId(inventory_id)
    const grid = await utilities.buildDetailsGrid(data)
    let nav = await utilities.getNav()
    const vehicleName = data.inv_model
    const vehicleYear = data.inv_year
    const vehicleMake = data.inv_make
    res.render("./inventory/detail", {
        title: vehicleYear + " " + vehicleMake + " " + vehicleName,
        nav, 
        grid,
        item: data
    })

} 

module.exports = invDetails