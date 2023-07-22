-- CreateTable
CREATE TABLE "Employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pwd" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "salary" INTEGER NOT NULL,
    "departement" TEXT NOT NULL,
    "joined_date" TIMESTAMP(3) NOT NULL,
    "verification_code" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sales_data" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "sales" INTEGER NOT NULL,

    CONSTRAINT "Sales_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employees_id_key" ON "Employees"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_name_key" ON "Employees"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_email_key" ON "Employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_verification_code_key" ON "Employees"("verification_code");

-- CreateIndex
CREATE UNIQUE INDEX "Sales_data_id_key" ON "Sales_data"("id");

-- AddForeignKey
ALTER TABLE "Sales_data" ADD CONSTRAINT "Sales_data_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
