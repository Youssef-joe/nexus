import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument, UserStatus } from '../schemas/user.schema';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const verificationToken = uuidv4();

    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      verificationToken,
      status: UserStatus.PENDING_VERIFICATION,
    });

    await user.save();

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    const { password, verificationToken: token, ...userResponse } = user.toObject();
    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: userResponse,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ 
      email: loginDto.email,
      role: loginDto.role 
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.PENDING_VERIFICATION) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    user.lastLogin = new Date();
    await user.save();

    const payload = { 
      sub: user._id, 
      email: user.email, 
      role: user.role 
    };

    const { password, verificationToken, resetPasswordToken, ...userResponse } = user.toObject();

    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({ verificationToken: token });
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    user.verified = true;
    user.status = UserStatus.ACTIVE;
    user.verificationToken = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email });
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: resetPasswordDto.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async validateUser(payload: any): Promise<any> {
    const user = await this.userModel.findById(payload.sub).select('-password');
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }
    return user;
  }
}