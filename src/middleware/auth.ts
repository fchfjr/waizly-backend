import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
const ACC_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const {
  Validator,
  addCustomMessages,
  extend,
} = require("node-input-validator");

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  if (
    !req?.headers?.authorization?.replace("Bearer ", "") &&
    req?.query?.token &&
    req?.cookies?.token
  ) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  const token =
    req?.headers?.authorization?.replace("Bearer ", "") ||
    req?.query?.token ||
    req?.cookies?.token;

  try {
    jwt.verify(token, ACC_TOKEN_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(401).json({ message: "Token Expired" });
      (req as any).id = decoded.id;
      (req as any).name = decoded.name;

      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};


const registerValidator = (req: Request, res: Response, next: NextFunction) => {
  extend("pwdValidate", () => {
    if (
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(req.body.pwd)
    ) {
      return true;
    } else {
      return false;
    }
  });

  addCustomMessages({
    "pwd.pwdValidate": `Passwords must have at least 8 characters and contain uppercase letters, lowercase letters, numbers, and symbols`,
  });
  const rules = new Validator(req.body, {
    email: "required|email",
    pwd: "required|pwdValidate",
    pwdAdmin: "required",
  });

  rules.check().then((matched: boolean) => {
    if (matched) {
      next();
    } else {
      console.log(rules.errors);
      res.status(422).json({
        message: rules.errors,
      });
    }
  });
};

const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const rules = new Validator(req.body, {
    email: "required|email",
    pwd: "required",
  });

  rules.check().then((matched: boolean) => {
    if (matched) {
      next();
    } else {
      console.log(rules.errors);
      res.status(422).json({
        message: rules.errors,
      });
    }
  });
};

const verifyValidator = (req: Request, res: Response, next: NextFunction) => {
  const rules = new Validator(req.body, {
    verification_code: "required|integer",
    email: "required|email",
  });

  rules.check().then((matched: boolean) => {
    if (matched) {
      next();
    } else {
      console.log(rules.errors);
      res.status(422).json({
        message: rules.errors,
      });
    }
  });
};

const emailValidator = (req: Request, res: Response, next: NextFunction) => {
  const rules = new Validator(req.body, {
    email: "required|email",
  });

  rules.check().then((matched: boolean) => {
    if (matched) {
      next();
    } else {
      console.log(rules.errors);
      res.status(422).json({
        message: rules.errors,
      });
    }
  });
};

const forgetPwdValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  extend("pwdValidate", () => {
    if (
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(req.body.pwd)
    ) {
      return true;
    } else {
      return false;
    }
  });

  addCustomMessages({
    "pwd.pwdValidate": `Passwords must have at least 8 characters and contain uppercase letters, lowercase letters, numbers, and symbols`,
  });
  const rules = new Validator(req.body, {
    email: "required|email",
    pwd: "required|pwdValidate",
    reset_token: "required",
  });

  rules.check().then((matched: boolean) => {
    if (matched) {
      next();
    } else {
      console.log(rules.errors);
      res.status(422).json({
        message: rules.errors,
      });
    }
  });
};

module.exports = {
  validateToken,
  registerValidator,
  loginValidator,
  verifyValidator,
  emailValidator,
  forgetPwdValidator,
};
