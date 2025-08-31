const express = require("express");
const authController = require("../controllers/auth-controller");




const router = express.Router();


router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.post("/change-password", authController.changePassword);


module.exports = router;
