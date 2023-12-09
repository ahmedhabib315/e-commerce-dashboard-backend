import { BadRequestException, Injectable } from '@nestjs/common';
import { SignIn, Signup, VerifyOtp } from './dto/auth.dto';
import { UserService } from '@app/user';
import { OtpService } from '@app/otp';
import { decryptData } from 'helper/encryption';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService
  ) { }

  async createUser(payload: Signup) {
    const userExists = await this.userService.getUser(payload.email);

    if (userExists) throw new BadRequestException('Email already exists');

    const newUser = await this.userService.createUser(payload);

    const otp = await this.otpService.createOtp(newUser.email);

    return {
      status: true,
      message: 'User created successfully',
      data: { newUser, otp },
    };
  }

  async verifyOtp(payload: VerifyOtp) {
    const otpVerified = await this.otpService.verifyOtp(
      payload.email,
      payload.otp,
    );

    if (!otpVerified) throw new BadRequestException('Invalid Otp');

    await this.userService.updateUser(payload.email, { active: true })

    return {
      status: true,
      message: 'User Verified successfully',
      data: { verified: true },
    };
  }

  async signIn(payload: SignIn, res: Response) {
    const user = await this.userService.authenticateUser(payload.email, payload.password);

    const tokens = await this.userService.getTokens(user.email, user.hash);

    await this.userService.updateUser(user.email, { refresh_token: tokens.refresh_token })

    res.cookie('ref', tokens.refresh_token);
    res.cookie('acc', tokens.access_token);

    return {
      status: true,
      message: 'User Signed In successfully',
      data: { email: user.email, token: tokens.access_token },
    };
  }

  async logout(){
    
  }
}
