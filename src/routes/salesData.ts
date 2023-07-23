import express from "express";
const router = express.Router();
const controller = require("../controller/salesData");
const { validateToken } = require("../middleware/auth");
const middleware = require("../middleware/salesData");

router.post(
  "/add",
  validateToken,
  middleware?.addSalesValidator,
  controller?.addSalesData
);

router.patch(
  "/edit",
  validateToken,
  middleware?.editSalesValidator,
  controller?.editSalesData
);

// router.get("/", validateToken, controller?.getEmployee);

router.delete("/delete/:id", validateToken, controller?.deleteSalesData);

module.exports = router;
