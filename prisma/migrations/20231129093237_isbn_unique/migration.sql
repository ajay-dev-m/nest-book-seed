/*
  Warnings:

  - A unique constraint covering the columns `[ISBN]` on the table `book` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "book_ISBN_key" ON "book"("ISBN");
