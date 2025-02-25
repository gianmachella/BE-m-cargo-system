const express = require("express");
const {
  getBatches,
  createBatch,
  getBatchById,
  updateBatch,
  deleteBatch,
} = require("../controllers/batchController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(getBatches).post(createBatch);
router.route("/:id").get(getBatchById).put(updateBatch).delete(deleteBatch);

module.exports = router;
