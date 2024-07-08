/*
  Warnings:

  - You are about to drop the column `orderStatus` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `orderStatus`,
    ADD COLUMN `status` ENUM('Unpaid', 'Paid', 'Processing', 'Shipped', 'Arrived', 'Departed', 'Delivered', 'Cancelled', 'RefundInitiated', 'Refunded') NOT NULL DEFAULT 'Unpaid';
