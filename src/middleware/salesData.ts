import { Request, Response, NextFunction } from "express";
const { Validator } = require("node-input-validator");

const addSalesValidator = (req: Request, res: Response, next: NextFunction) => {
  const rules = new Validator(req.body, {
    employee_id: "required",
    sales: "required|integer",
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

const editSalesValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rules = new Validator(req.body, {
    id: "required",
    sales: "required|integer",
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

module.exports = { addSalesValidator, editSalesValidator };
