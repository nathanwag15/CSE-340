// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/accountValidation")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildByInvId);
router.get("/", invController.renderInventoryHome)
router.get("/addItem", invController.renderAddItemView);
router.post(
  "/addItem",
  regValidate.inventoryRules(),
  regValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventoryItem)
)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))
router.post("/update/",
  regValidate.inventoryRules(),
  regValidate.checkUpdateData, 
  utilities.handleErrors(invController.updateInventory))
router.get("/delete/:inv_id",
  utilities.handleErrors(invController.renderDeleteConfirmation)
)
router.post("/delete/:inv_id", utilities.handleErrors(invController.deleteInventory))

// Add classification
router.get("/addClassification", invController.renderAddClassificationView)
router.post("/addClassification", invController.addClassification)


module.exports = router;