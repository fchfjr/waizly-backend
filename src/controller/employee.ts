import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { Request, Response } from "express";
import { validateEmail, validateId } from "../model/query";

const addEmployee = async (req: Request, res: Response) => {
  interface RequestBody {
    email: string;
    name: string;
    job_title: string;
    salary: number | string;
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

    let convertSalary;
    if (typeof salary === "string") convertSalary = parseInt(salary);
    else {
      convertSalary = salary;
    }

    const addEmployee = await prisma.employees.create({
      data: {
        name,
        email,
        job_title,
        salary: convertSalary,
        departement,
        joined_date: date.toISOString(),
      },
    });

    res.status(200).json({
      message: `Success add Employee Data: ${addEmployee?.name}, with ID: ${addEmployee?.id}`,
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
    id: string;
  }
  try {
    const {
      email,
      name,
      job_title,
      salary,
      departement,
      joined_date,
      id,
    }: RequestBody = req.body;

    const getData = await validateId({ id });

    if (!getData) {
      return res.status(422).json({
        message: `ID not valid`,
      });
    }

    if (getData?.is_admin === true) {
      return res.status(422).json({
        message: `Can't edit Data for Admin Account`,
      });
    }

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

    let convertSalary;
    if (salary) {
      if (typeof salary === "string") convertSalary = parseInt(salary);
      else {
        convertSalary = salary;
      }
    }

    await prisma.employees.update({
      where: { id },
      data: {
        email: email || getData?.email,
        name: name || getData?.name,
        job_title: job_title || getData?.job_title,
        salary: convertSalary || getData?.salary,
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

const getEmployee = async (req: Request, res: Response) => {
  try {
    const { totalEmployee, nameSalary, avgSalary }: any = req.query;

    let getData;
    if (!Object.keys(req.query).length) {
      getData = await prisma.employees.findMany({
        where: {
          is_admin: false,
        },
        select: {
          id: true,
          email: true,
          name: true,
          job_title: true,
          salary: true,
          departement: true,
          joined_date: true,
        },
      });
      res.status(200).json({
        total: getData?.length,
        data: getData,
      });
    } else {
      if (totalEmployee) {
        getData = await prisma.employees.findMany({
          where: {
            is_admin: false,
            job_title: { contains: totalEmployee, mode: "insensitive" },
          },
        });
        res.status(200).json({
          total: getData?.length,
        });
      } else if (nameSalary) {
        const splitted = nameSalary.split(",");
        getData = await prisma.employees.findMany({
          where: {
            is_admin: false,
            departement: {
              in: splitted,
              mode: "insensitive",
            },
          },
          select: {
            name: true,
            salary: true,
          },
        });

        res.status(200).json({
          total: getData?.length,
          data: getData,
        });
      } else if (avgSalary) {
        const currentDate = new Date();
        const fiveYearsAgo = new Date(
          currentDate.getFullYear() - 5,
          currentDate.getMonth(),
          currentDate.getDate()
        );

        const averageSalaryQuery = await prisma.employees.aggregate({
          _avg: {
            salary: true,
          },
          _count: {
            salary: true,
          },
          where: {
            joined_date: {
              gte: fiveYearsAgo.toISOString(),
            },
            is_admin: false,
          },
        });

        const averageSalary = averageSalaryQuery._avg.salary;
        const numberOfEmployees = averageSalaryQuery._count.salary;

        res.status(200).json({
          totalEmployees: numberOfEmployees,
          avgSalary: averageSalary,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const isValidId = await validateId({ id });
    if (!isValidId) {
      return res.status(422).json({
        message: `ID not valid`,
      });
    }

    await prisma.sales_data.deleteMany({
      where: {
        employee_id: id,
      },
    });

    await prisma.employees.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: `Success delete Employee with accountID: ${id}, name: ${isValidId?.name}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addEmployee, editEmployee, getEmployee, deleteEmployee };
