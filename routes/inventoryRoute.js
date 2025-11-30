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

// Add classification
router.get("/addClassification", invController.renderAddClassificationView)
router.post("/addClassification", invController.addClassification)


module.exports = router;