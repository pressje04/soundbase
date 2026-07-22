-- CreateTable
CREATE TABLE "PopularAlbum" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "albumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PopularAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PopularAlbum_year_position_key" ON "PopularAlbum"("year", "position");
CREATE UNIQUE INDEX "PopularAlbum_year_albumId_key" ON "PopularAlbum"("year", "albumId");
CREATE INDEX "PopularAlbum_year_updatedAt_idx" ON "PopularAlbum"("year", "updatedAt");

-- AddForeignKey
ALTER TABLE "PopularAlbum" ADD CONSTRAINT "PopularAlbum_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
