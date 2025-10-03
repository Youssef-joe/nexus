import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ReminderService } from './reminder.service';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ScheduleModule.forRoot(),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, ReminderService, EmailService],
  exports: [BookingsService],
})
export class BookingsModule {}