-- AlterTable
ALTER TABLE "Artist" ADD COLUMN "normalizedName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "genres" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "releaseDate" TEXT,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "albumType" TEXT,
    "totalTracks" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trackNumber" INTEGER,
    "durationMs" INTEGER,
    "artistName" TEXT,
    "albumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Artist_normalizedName_idx" ON "Artist"("normalizedName");
CREATE INDEX "Album_normalizedName_idx" ON "Album"("normalizedName");
CREATE INDEX "Album_artistId_idx" ON "Album"("artistId");
CREATE INDEX "Track_albumId_idx" ON "Track"("albumId");

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Track" ADD CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
