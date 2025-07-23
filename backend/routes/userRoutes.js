// /backend/routes/userRoutes.js

const express = require("express");
const userController = require("../controllers/userController");
const {
  validateUserCreation,
  validateUserUpdate,
} = require("../middleware/validators/userValidator");

const router = express.Router();

// GET /api/users - Get all users
router.get("/", userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", userController.getUserById);

// POST /api/users - Create new user
router.post("/", validateUserCreation, userController.createUser);

// PUT /api/users/:id - Update user
router.put("/:id", validateUserUpdate, userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete("/:id", userController.deleteUser);

module.exports = router;
