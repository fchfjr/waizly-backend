import express from "express";
const router = express.Router();
const controller = require("../controller/auth");
const middleware = require("../middleware/auth");
import rateLimitMiddleware from "../middleware/rateLimit";

router.post(
  "/register",
  middleware?.registerValidator,
  controller?.registerAdmin
);

router.post("/login", middleware?.loginValidator, controller?.login);
router.post("/verify", middleware?.verifyValidator, controller?.verify);
router.post(
  "/resend-verification",
  rateLimitMiddleware,
  middleware?.emailValidator,
  controller?.resendVerification
);
router.post(
  "/forget-pwd-sendToken",
  rateLimitMiddleware,
  middleware?.emailValidator,
  controller?.forgetPwdSendToken
);
router.patch(
  "/forget-pwd-reset",
  middleware?.forgetPwdValidator,
  controller?.forgetPwdReset
);

router.get("/refresh", controller.refreshToken);

module.exports = router;
