-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FOUNDATION', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Verification" AS ENUM ('VERIFIED', 'DIRECTORY');

-- CreateEnum
CREATE TYPE "StayStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('OCCASION', 'FEATURE', 'BUDGET');

-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('WATERFALL', 'VIEWPOINT', 'TREK', 'CAFE', 'TEMPLE', 'ESTATE', 'LAKE', 'OTHER');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TripStep" AS ENUM ('BOOKING_CONFIRMED', 'WEATHER', 'DIRECTIONS', 'CARETAKER_CONTACT', 'CHECKIN_GUIDE', 'THINGS_TO_PACK', 'NEARBY_ATTRACTIONS', 'ENJOY_STAY', 'LEAVE_REVIEW');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'DONE');

-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('DIRECT', 'AIRBNB', 'GOOGLE', 'MMT');

-- CreateTable
CREATE TABLE "Stay" (
    "id" TEXT NOT NULL,
    "propertyCode" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tagline" TEXT,
    "story" TEXT NOT NULL,
    "storyExcerpt" TEXT,
    "area" TEXT NOT NULL,
    "addressLine" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "distanceFromTownKm" DECIMAL(6,2),
    "basePricePerNight" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "maxGuests" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "acres" DECIMAL(6,2),
    "checkInTime" TEXT NOT NULL,
    "checkOutTime" TEXT NOT NULL,
    "fitScore" INTEGER,
    "tier" "Tier",
    "inspectedOn" TIMESTAMP(3),
    "inspectedBy" TEXT,
    "verification" "Verification" NOT NULL,
    "caretakerName" TEXT,
    "caretakerPhone" TEXT,
    "ratingAvg" DECIMAL(3,2),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER,
    "status" "StayStatus" NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoBucket" TEXT DEFAULT 'owners',
    "photoPath" TEXT,
    "bio" TEXT,
    "hostingSince" INTEGER,
    "languages" TEXT[],
    "location" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isPublicProfile" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayImage" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'stays',
    "path" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "mimeType" TEXT,

    CONSTRAINT "StayImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bedType" TEXT,
    "maxGuests" INTEGER NOT NULL,
    "imageBucket" TEXT DEFAULT 'stays',
    "imagePath" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayHighlight" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "StayHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayExperience" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageBucket" TEXT DEFAULT 'experiences',
    "imagePath" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "StayExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearbyPlace" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "PlaceCategory" NOT NULL,
    "distanceKm" DECIMAL(6,2),
    "driveTimeMinutes" INTEGER,
    "imageBucket" TEXT DEFAULT 'stays',
    "imagePath" TEXT,
    "mapsUrl" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NearbyPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayAmenity" (
    "stayId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,

    CONSTRAINT "StayAmenity_pkey" PRIMARY KEY ("stayId","amenityId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "TagType" NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayTag" (
    "stayId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "StayTag_pkey" PRIMARY KEY ("stayId","tagId")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "stayedOn" TIMESTAMP(3),
    "source" "ReviewSource" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewImage" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'reviews',
    "path" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "mimeType" TEXT,

    CONSTRAINT "ReviewImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayAvailability" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "priceOverride" DECIMAL(10,2),

    CONSTRAINT "StayAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "guestEmail" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL,
    "children" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "estimatedTotal" DECIMAL(10,2),
    "whatsappMessage" TEXT,
    "whatsappSentAt" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'WEBSITE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripTimelineStep" (
    "id" TEXT NOT NULL,
    "bookingRequestId" TEXT NOT NULL,
    "stepKey" "TripStep" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "status" "StepStatus" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TripTimelineStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "GuideCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelGuide" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImageBucket" TEXT DEFAULT 'guides',
    "coverImagePath" TEXT,
    "body" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "readTimeMinutes" INTEGER,
    "author" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "TravelGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideStay" (
    "guideId" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,

    CONSTRAINT "GuideStay_pkey" PRIMARY KEY ("guideId","stayId")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "supportPhone" TEXT,
    "supportEmail" TEXT,
    "instagramUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stay_propertyCode_key" ON "Stay"("propertyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Stay_slug_key" ON "Stay"("slug");

-- CreateIndex
CREATE INDEX "Stay_ownerId_idx" ON "Stay"("ownerId");

-- CreateIndex
CREATE INDEX "Stay_status_idx" ON "Stay"("status");

-- CreateIndex
CREATE INDEX "Stay_isFeatured_idx" ON "Stay"("isFeatured");

-- CreateIndex
CREATE INDEX "Stay_area_idx" ON "Stay"("area");

-- CreateIndex
CREATE INDEX "StayImage_stayId_idx" ON "StayImage"("stayId");

-- CreateIndex
CREATE UNIQUE INDEX "StayImage_bucket_path_key" ON "StayImage"("bucket", "path");

-- CreateIndex
CREATE INDEX "Room_stayId_idx" ON "Room"("stayId");

-- CreateIndex
CREATE INDEX "StayHighlight_stayId_idx" ON "StayHighlight"("stayId");

-- CreateIndex
CREATE INDEX "StayExperience_stayId_idx" ON "StayExperience"("stayId");

-- CreateIndex
CREATE INDEX "NearbyPlace_stayId_idx" ON "NearbyPlace"("stayId");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE INDEX "StayAmenity_stayId_idx" ON "StayAmenity"("stayId");

-- CreateIndex
CREATE INDEX "StayAmenity_amenityId_idx" ON "StayAmenity"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "StayTag_stayId_idx" ON "StayTag"("stayId");

-- CreateIndex
CREATE INDEX "StayTag_tagId_idx" ON "StayTag"("tagId");

-- CreateIndex
CREATE INDEX "Review_stayId_idx" ON "Review"("stayId");

-- CreateIndex
CREATE INDEX "ReviewImage_reviewId_idx" ON "ReviewImage"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewImage_bucket_path_key" ON "ReviewImage"("bucket", "path");

-- CreateIndex
CREATE INDEX "StayAvailability_stayId_idx" ON "StayAvailability"("stayId");

-- CreateIndex
CREATE UNIQUE INDEX "StayAvailability_stayId_date_key" ON "StayAvailability"("stayId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BookingRequest_reference_key" ON "BookingRequest"("reference");

-- CreateIndex
CREATE INDEX "BookingRequest_stayId_idx" ON "BookingRequest"("stayId");

-- CreateIndex
CREATE INDEX "BookingRequest_status_idx" ON "BookingRequest"("status");

-- CreateIndex
CREATE INDEX "TripTimelineStep_bookingRequestId_idx" ON "TripTimelineStep"("bookingRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideCategory_slug_key" ON "GuideCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TravelGuide_slug_key" ON "TravelGuide"("slug");

-- CreateIndex
CREATE INDEX "TravelGuide_categoryId_idx" ON "TravelGuide"("categoryId");

-- CreateIndex
CREATE INDEX "TravelGuide_isPublished_idx" ON "TravelGuide"("isPublished");

-- CreateIndex
CREATE INDEX "GuideStay_guideId_idx" ON "GuideStay"("guideId");

-- CreateIndex
CREATE INDEX "GuideStay_stayId_idx" ON "GuideStay"("stayId");

-- AddForeignKey
ALTER TABLE "Stay" ADD CONSTRAINT "Stay_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayImage" ADD CONSTRAINT "StayImage_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayHighlight" ADD CONSTRAINT "StayHighlight_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayExperience" ADD CONSTRAINT "StayExperience_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearbyPlace" ADD CONSTRAINT "NearbyPlace_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayAmenity" ADD CONSTRAINT "StayAmenity_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayAmenity" ADD CONSTRAINT "StayAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayTag" ADD CONSTRAINT "StayTag_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayTag" ADD CONSTRAINT "StayTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayAvailability" ADD CONSTRAINT "StayAvailability_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripTimelineStep" ADD CONSTRAINT "TripTimelineStep_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelGuide" ADD CONSTRAINT "TravelGuide_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GuideCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideStay" ADD CONSTRAINT "GuideStay_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "TravelGuide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideStay" ADD CONSTRAINT "GuideStay_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
