-- Add dietary classification and tenant/menu-scoped parent categories.
CREATE TYPE "DietaryType" AS ENUM ('UNSPECIFIED', 'VEGAN', 'NON_VEGAN');
ALTER TABLE "MenuItem" ADD COLUMN "dietaryType" "DietaryType" NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE "MenuCategory" ADD COLUMN "parentId" TEXT;
CREATE UNIQUE INDEX "MenuCategory_restaurantId_menuId_id_key" ON "MenuCategory"("restaurantId", "menuId", "id");
CREATE INDEX "MenuCategory_restaurantId_menuId_parentId_idx" ON "MenuCategory"("restaurantId", "menuId", "parentId");
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_restaurantId_menuId_parentId_fkey" FOREIGN KEY ("restaurantId", "menuId", "parentId") REFERENCES "MenuCategory"("restaurantId", "menuId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_not_own_parent" CHECK ("parentId" IS NULL OR "parentId" <> "id");
