const express = require("express")
const router = express.Router()
const favoritesController = require("../controllers/favoritesController")
const utilities = require("../utilities")

// Protect routes: must be logged in
router.use(utilities.checkJWTToken)

// // View favorites
router.get("/", favoritesController.buildByAccountId)

// Add a favorite
router.post("/add", favoritesController.addFavorite)

// Remove a favorite
router.post("/remove", favoritesController.removeFavorite)

module.exports = router