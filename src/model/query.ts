// only "GET" query, in order follow "DRY METHOD" rule

import { PrismaClient, Employees, Sales_data } from "@prisma/client";
const prisma = new PrismaClient();

interface ValidateEmailProps {
  email: string;
}

interface ValidateIdProps {
  id: string;
}



const validateEmail = async ({
  email,
}: ValidateEmailProps): Promise<Employees | null> => {
  return await prisma.employees.findUnique({
    where: { email },
  });
};

const validateId = async ({
  id,
}: ValidateIdProps): Promise<Employees | null> => {
  return await prisma.employees.findUnique({
    where: { id },
  });
};

const validateSalesId = async ({
  id,
}: ValidateIdProps): Promise<Sales_data | null> => {
  return await prisma.sales_data.findUnique({
    where: { id },
  });
};

export { validateEmail, validateId, validateSalesId };
