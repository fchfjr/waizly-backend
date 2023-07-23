import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { Request, Response } from "express";
import { validateId, validateSalesId } from "../model/query";

const addSalesData = async (req: Request, res: Response) => {
  interface RequestBody {
    employee_id: string;
    sales: number | string;
  }
  try {
    const { sales, employee_id }: RequestBody = req.body;

    const isValidId = await validateId({ id: employee_id });
    if (!isValidId) {
      return res.status(422).json({
        message: `ID not valid`,
      });
    }
    if (isValidId?.is_admin === true) {
      return res.status(422).json({
        message: `Can't add Sales Data for Admin Account`,
      });
    }

    let convertSales;
    if (typeof sales === "string") convertSales = parseInt(sales);
    else {
      convertSales = sales;
    }

    const createSalesData = await prisma.sales_data.create({
      data: {
        employee_id,
        sales: convertSales,
      },
    });

    res.status(200).json({
      message: `Success add SalesData. id: ${createSalesData?.id} & employee_id: ${employee_id}  `,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editSalesData = async (req: Request, res: Response) => {
  interface RequestBody {
    sales: number | string;
    id: string;
  }

  try {
    const { sales, id }: RequestBody = req.body;

    const validateId = await validateSalesId({ id });
    if (!validateId)
      return res.status(422).json({
        message: `ID not valid`,
      });

    let convertSales;
    if (typeof sales === "string") convertSales = parseInt(sales);
    else {
      convertSales = sales;
    }

    await prisma.sales_data.update({
      where: { id },
      data: {
        sales: convertSales,
      },
    });

    res.status(200).json({
      message: `Success edit Sales Data`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteSalesData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validateId = await validateSalesId({ id });
    if (!validateId)
      return res.status(422).json({
        message: `ID not valid`,
      });

    await prisma.sales_data.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: `Success delete sales data with id: ${id}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addSalesData, editSalesData, deleteSalesData };
