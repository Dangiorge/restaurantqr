-- Optional guest welcome imagery, daily recommendations and event posters.
ALTER TABLE "RestaurantSettings" ADD COLUMN "guestContent" JSONB NOT NULL DEFAULT '{}';
