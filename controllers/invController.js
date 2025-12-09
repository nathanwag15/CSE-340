const invModel = require("../models/inventory-model")
const favoriteModel = require("../models/favorites-model")
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
    console.log(data)
    res.render("./inventory/classification", {
        title:  " vehicles",
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

    let favorite = false
    if (res.locals.accountData) {
      favorite = await favoriteModel.isFavorite(res.locals.accountData.account_id, invId)
    }


    res.render(`inventory/detail`, {
        title: vehicleYear + " " +vehicleMake + " " + vehicleModel , 
        nav, 
        grid,
        item: data,
        favorite
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
      data: null,
      errors: null
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

    const result = await invModel.getClassifications()
    
    const classifications = result.rows

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
      return res.render("inventory/add-item", { 
      title: "Add Inventory Item",
      nav,
      classifications,
      message: req.flash("message"), // for optional flash display in view
      data: null,
      errors: null
    })// redirect to avoid duplicate submission
    } else {
      req.flash("message", "Sorry, adding the inventory item failed.")
      res.status(501).render("inventory/add-item", { 
      title: "Add Inventory Item",
      nav,
      classifications,
      message: req.flash("message"), // for optional flash display in view
      data: null,
      errors: null
    })
    }
  } catch (err) {
    next(err) // ✅ lets middleware handle errors
  }
}

invCont.renderInventoryHome = async function(req, res, next) {
  try {
    const nav = await utilities.getNav()

    const classificationSelect = await invModel.getClassifications()

    const classificationSelectList = classificationSelect.rows

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelectList,
      message: req.flash("message"),
      success: req.flash("success"),
      data: null,
      errors: null,

    })
  } catch (err) {
    next(err)
  }
}

// Render add classification view
invCont.renderAddClassificationView = async function(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/addClassification", {
      title: "Add Classification",
      nav,
      message: req.flash("message"),
      success: req.flash("success"),
      data: null,
      errors: [],
    })
  } catch (err) {
    next(err)
  }
}

// Handle add classification form submission
invCont.addClassification = async function(req, res, next) {
  try {
    const { classification_name } = req.body
    if (!classification_name || classification_name.trim() === "") {
      req.flash("message", "Classification name is required")
      return res.redirect("/inv/addClassification")
    }

    const result = await invModel.addClassification(classification_name.trim())

    if (result) {
      req.flash("success", `Classification '${classification_name}' added successfully.`)
    } else {
      req.flash("message", "Failed to add classification.")
    }

    res.redirect("/inv/addClassification")
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ****************************************
*  Render Add Inv View
* *************************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getDetailsByInventoryId(inv_id)
  const classificationSelectObject = await invModel.getClassifications()
  const classificationSelect = classificationSelectObject.rows
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}



/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ****************************************
*  Render Delete Inv View
* *************************************** */
invCont.renderDeleteConfirmation = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getDetailsByInventoryId(inv_id)
  const classificationSelectObject = await invModel.getClassifications()
  const classificationSelect = classificationSelectObject.rows
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Edit " + itemName,
    name: itemData.inv_model + " " + itemData.inv_make,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,    
    inv_price: itemData.inv_price,
    message: req.flash("message"),
    success: req.flash("success"),
    
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id)
   if (isNaN(inv_id)) {
      req.flash("message", "Invalid inventory ID");
      return res.redirect("/inv/");
    }
  
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("message", `The vehicle was successfully deleted`)
    res.redirect("/inv/")
  } else {
    req.flash("message", "Sorry, the delete failed.")
    res.redirect("/inv/")

  }
}


module.exports = invCont