import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    try {
      const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: this.configService.get('FROM_EMAIL'),
        to: email,
        subject: 'Verify Your L&D Nexus Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to L&D Nexus!</h2>
            <p>Thank you for registering with L&D Nexus. Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Verify Email
            </a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't create an account with L&D Nexus, please ignore this email.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn('Email sending failed:', error.message);
      // In development, we'll just log the verification URL
      if (this.configService.get('NODE_ENV') === 'development') {
        const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
        console.log(`\n🔗 Email verification URL for ${email}:`);
        console.log(verificationUrl);
        console.log('\n');
      }
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: this.configService.get('FROM_EMAIL'),
        to: email,
        subject: 'Reset Your L&D Nexus Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>You requested to reset your password for your L&D Nexus account. Click the button below to reset it:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Reset Password
            </a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn('Password reset email failed:', error.message);
      if (this.configService.get('NODE_ENV') === 'development') {
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
        console.log(`\n🔗 Password reset URL for ${email}:`);
        console.log(resetUrl);
        console.log('\n');
      }
    }
  }

  async sendProjectNotification(email: string, projectTitle: string, type: 'application' | 'acceptance' | 'completion') {
    try {
      let subject = '';
      let content = '';

      switch (type) {
        case 'application':
          subject = 'New Application Received';
          content = `You have received a new application for your project "${projectTitle}".`;
          break;
        case 'acceptance':
          subject = 'Application Accepted';
          content = `Your application for "${projectTitle}" has been accepted!`;
          break;
        case 'completion':
          subject = 'Project Completed';
          content = `The project "${projectTitle}" has been marked as completed.`;
          break;
      }

      const mailOptions = {
        from: this.configService.get('FROM_EMAIL'),
        to: email,
        subject: `L&D Nexus - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">${subject}</h2>
            <p>${content}</p>
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              View Dashboard
            </a>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn(`Project notification email failed for ${type}:`, error.message);
      if (this.configService.get('NODE_ENV') === 'development') {
        console.log(`\n📧 ${type} notification for ${email}: ${projectTitle}\n`);
      }
    }
  }
}