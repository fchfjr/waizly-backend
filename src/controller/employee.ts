import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { Request, Response } from "express";
import { validateEmail } from "../model/query";

const addEmployee = async (req: Request, res: Response) => {
  interface RequestBody {
    email: string;
    name: string;
    job_title: string;
    salary: number;
    departement: string;
    joined_date: string;
  }

  try {
    const {
      email,
      name,
      job_title,
      salary,
      departement,
      joined_date,
    }: RequestBody = req.body;

    const isEmailExist = await validateEmail({ email });

    if (isEmailExist) {
      return res.status(422).json({
        message: `Email already exist`,
      });
    }

    const date = new Date(joined_date);
    if (isNaN(date.getTime())) {
      return res.status(422).json({
        message:
          "Invalid joined_date format. Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    const addEmployee = await prisma.employees.create({
      data: {
        name,
        job_title,
        salary,
        departement,
        joined_date: date.toISOString(),
      },
    });

    res.status(200).json({
      message: `Success add Employee Data: ${addEmployee?.name}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editEmployee = async (req: Request, res: Response) => {
  interface RequestBody {
    email: string;
    name: string;
    job_title: string;
    salary: number;
    departement: string;
    joined_date: string;
  }
  try {
    const {
      email,
      name,
      job_title,
      salary,
      departement,
      joined_date,
    }: RequestBody = req.body;

    const { id } = req.params;

    const getData = await prisma.employees.findUnique({
      where: { id },
    });

    if (email) {
      const isEmailExist = await validateEmail({ email });
      if (isEmailExist) {
        return res.status(422).json({
          message: `Email already exist`,
        });
      }
    }
    let date;
    if (joined_date) {
      date = new Date(joined_date);

      if (isNaN(date.getTime())) {
        return res.status(422).json({
          message:
            "Invalid joined_date format. Please provide a valid date in YYYY-MM-DD format.",
        });
      }
    }

    await prisma.employees.update({
      where: { id },
      data: {
        name: name || getData?.name,
        job_title: job_title || getData?.job_title,
        salary: salary || getData?.salary,
        departement: departement || getData?.departement,
        joined_date: date?.toISOString() || getData?.joined_date,
      },
    });

    res.status(200).json({
      message: `Success edit Employee Data with id: ${getData?.id}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const {id} = req.params

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addEmployee, editEmployee, deleteEmployee };
