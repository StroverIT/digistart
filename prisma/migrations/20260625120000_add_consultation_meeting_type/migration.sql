-- AlterTable
ALTER TABLE "ConsultationBooking" ADD COLUMN "meetingType" TEXT NOT NULL DEFAULT 'online';
ALTER TABLE "ConsultationBooking" ADD COLUMN "address" TEXT;
