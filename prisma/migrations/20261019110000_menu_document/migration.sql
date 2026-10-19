-- Additive: existing menus keep their names, categories and items.
ALTER TABLE "Menu" ADD COLUMN "documentUrl" TEXT NOT NULL DEFAULT '';
