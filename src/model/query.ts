// only "GET" query, in order follow "DRY METHOD" rule

import { PrismaClient, Employees } from "@prisma/client";
const prisma = new PrismaClient();

interface ValidateEmailProps {
  email: string;
}

const validateEmail = async ({
  email,
}: ValidateEmailProps): Promise<Employees | null> => {
  return await prisma.employees.findUnique({
    where: { email },
  });
};

export { validateEmail };
