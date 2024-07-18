const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");

const router = express.Router();
router.use(express.json());

//protect -> //by this only logged in users can access these routes

//in this we send in req parameters one particular user.id .So in this one user send one user.id from which it wants to see its chats with.If it is not created then one chat is created.
router.route("/").post(protect, accessChat);

//it returns all the chats which one particular user have
router.route("/").get(protect, fetchChats);

router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);

router.route("/groupadd").put(protect, addToGroup);

router.route("/groupremove").put(protect, removeFromGroup);
module.exports = router;
