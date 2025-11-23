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

module.exports = invCont