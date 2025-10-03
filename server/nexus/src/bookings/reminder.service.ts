import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsService } from './bookings.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private bookingsService: BookingsService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    this.logger.log('Checking for upcoming bookings to send reminders...');
    
    try {
      const upcomingBookings = await this.bookingsService.getUpcomingBookings();
      
      for (const booking of upcomingBookings) {
        const hoursUntilBooking = (booking.startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilBooking <= booking.reminderHours) {
          await this.sendReminderEmail(booking);
          await this.bookingsService.markReminderSent((booking as any)._id.toString());
          this.logger.log(`Reminder sent for booking: ${booking.title}`);
        }
      }
    } catch (error) {
      this.logger.error('Error sending reminders:', error);
    }
  }

  private async sendReminderEmail(booking: any): Promise<void> {
    const subject = `Reminder: ${booking.title} - Tomorrow`;
    const content = `
      This is a reminder for your upcoming booking:
      
      📅 ${booking.title}
      🕐 ${booking.startTime.toLocaleDateString()} at ${booking.startTime.toLocaleTimeString()}
      📍 ${booking.isOnline ? 'Online Meeting' : booking.location || 'Location TBD'}
      ${booking.meetingLink ? `🔗 Join: ${booking.meetingLink}` : ''}
      
      ${booking.notes ? `Notes: ${booking.notes}` : ''}
      
      Please be prepared and join on time.
    `;

    await Promise.all([
      this.emailService.sendEmail(booking.organizationId.email, subject, content),
      this.emailService.sendEmail(booking.professionalId.email, subject, content),
    ]);
  }
}