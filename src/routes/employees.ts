import express from "express";
const router = express.Router();
const controller = require("../controller/employee");
const { validateToken } = require("../middleware/auth");
const middleware = require("../middleware/employee");

router.post(
  "/add",
  validateToken,
  middleware?.addEmployeeValidator,
  controller?.addEmployee
);

router.patch(
  "/edit/:id",
  validateToken,
  middleware?.editEmployeeValidator,
  controller?.editEmployee
);

router.get("/", validateToken, controller?.getEmployee);

router.delete("/delete/:id", validateToken, controller?.deleteEmployee);

module.exports = router;
