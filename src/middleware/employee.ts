import { Request, Response, NextFunction } from "express";
const {
  Validator,
  addCustomMessages,
  extend,
} = require("node-input-validator");

const addEmployeeValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rules = new Validator(req.body, {
    email: "required|email",
    name: "required|string",
    job_title: "required|string",
    salary: "required|integer",
    departement: "required|string",
    joined_date: "required",
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

const editEmployeeValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rules = new Validator(req.body, {
    email: "email",
    name: "string",
    job_title: "string",
    salary: "integer",
    departement: "string",
    joined_date: "string",
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
  addEmployeeValidator,
  editEmployeeValidator,
};
