const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middlewares/authMiddleware");

// /user/anything route will come here
const router = express.Router();
router.use(express.json());

router.route("/").post(registerUser);
router.post("/login", authUser);
router.route("/").get(protect, allUsers);

module.exports = router;
