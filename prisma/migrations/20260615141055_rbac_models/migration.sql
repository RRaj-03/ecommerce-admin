-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "estimatedDelivery" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'stripe',
ADD COLUMN     "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "priceAtTime" DECIMAL(65,30),
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "assembly" TEXT,
ADD COLUMN     "compareAtPrice" DECIMAL(65,30),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "materialsAndCare" TEXT,
ADD COLUMN     "measurements" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "weight" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "googleId" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreMember" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreInvite" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreTheme" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "preset" TEXT NOT NULL DEFAULT 'default',
    "primaryColor" TEXT NOT NULL DEFAULT '222.2 47.4% 11.2%',
    "secondaryColor" TEXT NOT NULL DEFAULT '210 40% 96.1%',
    "accentColor" TEXT NOT NULL DEFAULT '210 40% 96.1%',
    "backgroundColor" TEXT NOT NULL DEFAULT '0 0% 100%',
    "foregroundColor" TEXT NOT NULL DEFAULT '222.2 84% 4.9%',
    "mutedColor" TEXT NOT NULL DEFAULT '210 40% 96.1%',
    "mutedForeground" TEXT NOT NULL DEFAULT '215.4 16.3% 46.9%',
    "borderColor" TEXT NOT NULL DEFAULT '214.3 31.8% 91.4%',
    "cardColor" TEXT NOT NULL DEFAULT '0 0% 100%',
    "destructiveColor" TEXT NOT NULL DEFAULT '0 84.2% 60.2%',
    "darkPrimary" TEXT NOT NULL DEFAULT '210 40% 98%',
    "darkSecondary" TEXT NOT NULL DEFAULT '217.2 32.6% 17.5%',
    "darkAccent" TEXT NOT NULL DEFAULT '217.2 32.6% 17.5%',
    "darkBackground" TEXT NOT NULL DEFAULT '222.2 84% 4.9%',
    "darkForeground" TEXT NOT NULL DEFAULT '210 40% 98%',
    "darkMuted" TEXT NOT NULL DEFAULT '217.2 32.6% 17.5%',
    "darkMutedFg" TEXT NOT NULL DEFAULT '215 20.2% 65.1%',
    "darkBorder" TEXT NOT NULL DEFAULT '217.2 32.6% 17.5%',
    "darkCard" TEXT NOT NULL DEFAULT '222.2 84% 4.9%',
    "darkDestructive" TEXT NOT NULL DEFAULT '0 62.8% 30.6%',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "headingFont" TEXT NOT NULL DEFAULT 'Inter',
    "borderRadius" TEXT NOT NULL DEFAULT '0.5rem',
    "navbarStyle" TEXT NOT NULL DEFAULT 'default',
    "footerStyle" TEXT NOT NULL DEFAULT 'default',
    "productCardStyle" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "stripeKey" TEXT NOT NULL DEFAULT '',
    "phonepeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "phonepeMerchantId" TEXT NOT NULL DEFAULT '',
    "phonepeSaltKey" TEXT NOT NULL DEFAULT '',
    "phonepeSaltIndex" INTEGER NOT NULL DEFAULT 1,
    "codEnabled" BOOLEAN NOT NULL DEFAULT false,
    "codMinOrder" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "codMaxOrder" DECIMAL(65,30) NOT NULL DEFAULT 99999,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_storeId_email_key" ON "Customer"("storeId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_storeId_googleId_key" ON "Customer"("storeId", "googleId");

-- CreateIndex
CREATE INDEX "Role_storeId_idx" ON "Role"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_storeId_name_key" ON "Role"("storeId", "name");

-- CreateIndex
CREATE INDEX "Permission_roleId_idx" ON "Permission"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_roleId_resource_action_key" ON "Permission"("roleId", "resource", "action");

-- CreateIndex
CREATE INDEX "StoreMember_storeId_idx" ON "StoreMember"("storeId");

-- CreateIndex
CREATE INDEX "StoreMember_userId_idx" ON "StoreMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreMember_storeId_userId_key" ON "StoreMember"("storeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreInvite_token_key" ON "StoreInvite"("token");

-- CreateIndex
CREATE INDEX "StoreInvite_storeId_idx" ON "StoreInvite"("storeId");

-- CreateIndex
CREATE INDEX "StoreInvite_token_idx" ON "StoreInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "StoreInvite_storeId_email_key" ON "StoreInvite"("storeId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "StoreTheme_storeId_key" ON "StoreTheme"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentConfig_storeId_key" ON "PaymentConfig"("storeId");

-- CreateIndex
CREATE INDEX "Page_storeId_idx" ON "Page"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_storeId_slug_key" ON "Page"("storeId", "slug");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

-- CreateIndex
CREATE INDEX "CustomerAddress_customerId_idx" ON "CustomerAddress"("customerId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInvite" ADD CONSTRAINT "StoreInvite_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInvite" ADD CONSTRAINT "StoreInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreTheme" ADD CONSTRAINT "StoreTheme_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentConfig" ADD CONSTRAINT "PaymentConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
