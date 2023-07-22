import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const dbRandomInt = async () => {
  let randomInt = generateRandomInt();
  while (await isVerificationCodeExists(randomInt)) {
    randomInt = generateRandomInt();
  }
  return randomInt;
};

const generateRandomInt = () => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const isVerificationCodeExists = async (code: number) => {
  const existingAdmin = await prisma.employees.findFirst({
    where: { verification_code: code },
  });
  return existingAdmin !== null;
};

export const generateRandomStr = (length: number) => {
  const characterSet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characterSet.length);
    randomString += characterSet[randomIndex];
  }

  return randomString;
};
