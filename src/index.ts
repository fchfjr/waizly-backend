require("dotenv").config();
import express from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import cors from "cors";

const cookieParser = require("cookie-parser");
var middleware = require("./middleware/log");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use(middleware.logRequest);

app.use("/auth", require("./routes/auth"));

app.listen(3001, () =>
  console.log("REST API server ready at: http://localhost:3001")
);
