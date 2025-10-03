import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from '../schemas/booking.schema';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from '../dto/booking.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private emailService: EmailService,
  ) {}

  async create(createBookingDto: CreateBookingDto, organizationId: string): Promise<Booking> {
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    // Check for conflicts
    const conflict = await this.bookingModel.findOne({
      professionalId: createBookingDto.professionalId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflict) {
      throw new BadRequestException('Time slot conflicts with existing booking');
    }

    const booking = new this.bookingModel({
      ...createBookingDto,
      organizationId,
      startTime,
      endTime,
    });

    const savedBooking = await booking.save();
    await this.sendBookingNotification(savedBooking, 'created');
    return savedBooking.populate(['organizationId', 'professionalId']);
  }

  async findAll(userId: string, userRole: string): Promise<Booking[]> {
    const filter = userRole === 'professional' 
      ? { professionalId: userId }
      : { organizationId: userId };

    return this.bookingModel
      .find(filter)
      .populate(['organizationId', 'professionalId', 'projectId'])
      .sort({ startTime: 1 });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate(['organizationId', 'professionalId', 'projectId']);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: string): Promise<Booking> {
    const booking = await this.findOne(id);
    
    if (booking.organizationId.toString() !== userId && booking.professionalId.toString() !== userId) {
      throw new BadRequestException('Not authorized to update this booking');
    }

    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      const startTime = new Date(updateBookingDto.startTime || booking.startTime);
      const endTime = new Date(updateBookingDto.endTime || booking.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate(['organizationId', 'professionalId', 'projectId']);

    await this.sendBookingNotification(updatedBooking, 'updated');
    return updatedBooking;
  }

  async cancel(id: string, cancelBookingDto: CancelBookingDto, userId: string): Promise<Booking> {
    const booking = await this.findOne(id);
    
    if (booking.organizationId.toString() !== userId && booking.professionalId.toString() !== userId) {
      throw new BadRequestException('Not authorized to cancel this booking');
    }

    const cancelledBooking = await this.bookingModel
      .findByIdAndUpdate(id, {
        status: BookingStatus.CANCELLED,
        cancelledBy: userId,
        cancelledAt: new Date(),
        cancellationReason: cancelBookingDto.reason,
      }, { new: true })
      .populate(['organizationId', 'professionalId', 'projectId']);

    await this.sendBookingNotification(cancelledBooking, 'cancelled');
    return cancelledBooking;
  }

  async getUpcomingBookings(): Promise<Booking[]> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.bookingModel
      .find({
        startTime: { $gte: now, $lte: tomorrow },
        status: BookingStatus.CONFIRMED,
        reminderEnabled: true,
        reminderSent: false,
      })
      .populate(['organizationId', 'professionalId']);
  }

  async markReminderSent(bookingId: string): Promise<void> {
    await this.bookingModel.findByIdAndUpdate(bookingId, { reminderSent: true });
  }

  private async sendBookingNotification(booking: any, action: string): Promise<void> {
    const org = booking.organizationId;
    const prof = booking.professionalId;

    const subject = `Booking ${action}: ${booking.title}`;
    const content = `
      Your booking has been ${action}.
      
      Details:
      - Title: ${booking.title}
      - Date: ${booking.startTime.toLocaleDateString()}
      - Time: ${booking.startTime.toLocaleTimeString()} - ${booking.endTime.toLocaleTimeString()}
      - Type: ${booking.type}
      ${booking.location ? `- Location: ${booking.location}` : ''}
      ${booking.meetingLink ? `- Meeting Link: ${booking.meetingLink}` : ''}
    `;

    await Promise.all([
      this.emailService.sendEmail(org.email, subject, content),
      this.emailService.sendEmail(prof.email, subject, content),
    ]);
  }
}