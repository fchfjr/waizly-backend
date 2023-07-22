import { Request, Response, NextFunction } from "express";
import morgan from "morgan";

const logRequest = (req: Request, res: Response, next: NextFunction ) => {
  console.log("Request running on Path:", req.originalUrl);
  console.log("Request type:", req.method);
  next();
};

const urlValidator = (req: Request, res: Response) => {
  res.status(404).json({
    message: "404",
  });
};

// module.exports = { logRequest, urlValidator };

// (morgan("combined"));
// (morgan("common"));
// (morgan("dev"));
// (morgan("short"));
// (morgan("tiny"));

// const logRequest = morgan("dev");

// const urlValidator = (req: Request, res: Response) => {
//   res.status(404).json({
//     message: "404",
//   });
// };

export { logRequest, urlValidator };
