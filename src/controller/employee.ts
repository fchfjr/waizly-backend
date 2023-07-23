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
  interface EmployeeWithAvgSalary {
    name: string;
    salary: number;
    departement: string;
    avgSalary: number;
  }

  interface EmployeeSalesRanking {
    id: string;
    name: string;
    job_title: string;
    departement: string;
    joined_date: Date;
    total: number;
    totalqty: number;
    rank: number;
  }

  try {
    const {
      totalEmployee,
      employeeSalary,
      avgSalary,
      topFiveSales,
      highSalaryDepartements,
      employeeSalesRank,
      totalEmployeeSalary,
    }: any = req.query;

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
      } else if (employeeSalary) {
        const splitted = employeeSalary.split(",");
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
            job_title: true,
            departement: true,
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
      } else if (topFiveSales) {
        const topFive: [{}] = await prisma.$queryRaw`
        SELECT e.id, e.name, e.job_title, e.salary, e.departement, e.joined_date, SUM(s.sales) as total
        FROM "Employees" e
        JOIN "Sales_data" s ON e.id = s.employee_id
        WHERE e.is_admin = false
        GROUP BY e.id
        ORDER BY total DESC
        LIMIT 5`;

        const topFiveFormatted = topFive.map((item: any) => ({
          ...item,
          total: Number(item.total),
        }));

        res.status(200).json(topFiveFormatted);
      } else if (highSalaryDepartements) {
        const overallAverageSalaryQuery: any = await prisma.$queryRaw`
        SELECT AVG(salary) as averageSalary
        FROM "Employees"
      `;
        const overallAverageSalary =
          overallAverageSalaryQuery[0]?.averageSalary || 0;

        const highestAverageSalaryQuery: any = await prisma.$queryRaw`
        SELECT departement, AVG(salary) as averageSalary
        FROM "Employees"
        GROUP BY departement
        HAVING AVG(salary) >= ${overallAverageSalary}
        ORDER BY averageSalary DESC
        LIMIT 1
      `;

        const highestSalaryDepartment =
          highestAverageSalaryQuery[0]?.departement;

        if (!highestSalaryDepartment) {
          res
            .status(404)
            .json({ message: "Highest salary department not found" });
          return;
        }

        const employeesInHighestSalaryDept: EmployeeWithAvgSalary[] =
          await prisma.$queryRaw`
           SELECT name, salary, departement,
          (SELECT AVG(salary) FROM "Employees" WHERE departement = ${highestSalaryDepartment}) as avgSalary
          FROM "Employees"
          WHERE is_admin = false AND departement = ${highestSalaryDepartment}
        `;

        res.status(200).json(employeesInHighestSalaryDept);
      } else if (employeeSalesRank) {
        const topEmployee: EmployeeSalesRanking[] = await prisma.$queryRaw`
        SELECT e.id, e.name, e.job_title, e.departement, e.joined_date, 
        SUM(s.sales) as total, COUNT(s.id) as totalqty,
        RANK() OVER (ORDER BY SUM(s.sales) DESC) as rank
        FROM "Employees" e
        JOIN "Sales_data" s ON e.id = s.employee_id
        WHERE e.is_admin = false
        GROUP BY e.id
        ORDER BY total DESC
      `;

        const topEmployeeFormatted = topEmployee.map((item) => ({
          ...item,
          total: Number(item.total),
          totalqty: Number(item.totalqty),
          rank: Number(item.rank),
        }));
        res.status(200).json(topEmployeeFormatted);
      } else if (totalEmployeeSalary) {
        if (totalEmployeeSalary.split(",").length > 1) {
          return res.status(422).json({
            message: `Only accept 1 departement at a time`,
          });
        }

        const splitted = totalEmployeeSalary.split(",");
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
            job_title: true,
            departement: true,
            joined_date: true,
          },
        });

        let totalSalary = 0;
        if (getData !== null) {
          for (let i = 0; i < getData.length; i++) {
            totalSalary += getData[i]?.salary || 0;
          }
        }

        res.status(200).json({
          totalEmployee: getData?.length,
          totalSalary,
          data: getData,
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
