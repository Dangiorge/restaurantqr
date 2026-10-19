-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceRequestType" AS ENUM ('WAITER', 'BILL', 'WATER', 'CUTLERY', 'HELP');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "publicExpiresAt" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "notes" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "subtotal" DECIMAL(16,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL,
    "serviceChargeRate" DECIMAL(5,2) NOT NULL,
    "taxAmount" DECIMAL(16,2) NOT NULL,
    "serviceAmount" DECIMAL(16,2) NOT NULL,
    "total" DECIMAL(16,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "lineTotal" DECIMAL(16,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "publicExpiresAt" TIMESTAMP(3) NOT NULL,
    "type" "ServiceRequestType" NOT NULL,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");

-- CreateIndex
CREATE INDEX "Order_restaurantId_branchId_status_createdAt_idx" ON "Order"("restaurantId", "branchId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_qrCodeId_requestKey_key" ON "Order"("qrCodeId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "Order_restaurantId_id_key" ON "Order"("restaurantId", "id");

-- CreateIndex
CREATE INDEX "OrderItem_restaurantId_orderId_idx" ON "OrderItem"("restaurantId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_publicToken_key" ON "ServiceRequest"("publicToken");

-- CreateIndex
CREATE INDEX "ServiceRequest_restaurantId_branchId_status_createdAt_idx" ON "ServiceRequest"("restaurantId", "branchId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_qrCodeId_requestKey_key" ON "ServiceRequest"("qrCodeId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "DiningTable_restaurantId_branchId_id_key" ON "DiningTable"("restaurantId", "branchId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_restaurantId_tableId_id_key" ON "QrCode"("restaurantId", "tableId", "id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantId_branchId_tableId_fkey" FOREIGN KEY ("restaurantId", "branchId", "tableId") REFERENCES "DiningTable"("restaurantId", "branchId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantId_tableId_qrCodeId_fkey" FOREIGN KEY ("restaurantId", "tableId", "qrCodeId") REFERENCES "QrCode"("restaurantId", "tableId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_restaurantId_orderId_fkey" FOREIGN KEY ("restaurantId", "orderId") REFERENCES "Order"("restaurantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_restaurantId_branchId_tableId_fkey" FOREIGN KEY ("restaurantId", "branchId", "tableId") REFERENCES "DiningTable"("restaurantId", "branchId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_restaurantId_tableId_qrCodeId_fkey" FOREIGN KEY ("restaurantId", "tableId", "qrCodeId") REFERENCES "QrCode"("restaurantId", "tableId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
