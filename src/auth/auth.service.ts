import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GenerateOtp, SignIn, Signup, VerifyOtp } from './dto/auth.dto';
import { UserService } from '@app/user';
import { OtpService } from '@app/otp';
import { Response } from 'express';
import { ApiResponse } from 'common/types';
import { CONSTANTS } from 'common/constants';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}

  /**
   *
   * Create User and OTP on sign up
   *
   * @param payload
   * @returns Promise<Response>
   */
  async createUser(payload: Signup): Promise<ApiResponse> {
    const userExists = await this.userService.getUserByEmail(payload.email);

    if (userExists) throw new BadRequestException('Email already exists');

    const newUser = await this.userService.createUser(payload, false);

    const otp = await this.otpService.createOtp(newUser.email);

    return {
      status: true,
      message: 'User created successfully',
      data: { newUser, otp },
    };
  }

  /**
   *
   * Verify OTP and update user active status
   *
   * @param payload
   * @returns  Promise<ApiResponse>
   */
  async verifyOtp(payload: VerifyOtp): Promise<ApiResponse> {
    const userExists = await this.userService.getUserByEmail(payload.email, {
      isDeleted: false,
    });

    if (!userExists) throw new BadRequestException('Email does not exists');

    if (userExists.active)
      throw new BadRequestException('User already verified');

    const otpVerified = await this.otpService.verifyOtp(
      userExists.email,
      payload.otp,
    );

    if (!otpVerified) throw new BadRequestException('Invalid Otp');

    await this.userService.updateUser(payload.email, { active: true });

    return {
      status: true,
      message: 'User Verified successfully',
      data: { verified: true },
    };
  }

  /**
   *
   * Generate OTP
   *
   * @param payload
   * @returns  Promise<ApiResponse>
   */
  async generateOtp(payload: GenerateOtp): Promise<ApiResponse> {
    const userExists = await this.userService.getUserByEmail(payload.email, {
      isDeleted: false,
    });

    if (!userExists) throw new BadRequestException('Email does not exists');

    const otp = await this.otpService.createOtp(userExists.email);

    return {
      status: true,
      message: 'OTP generated successfully',
      data: { otp },
    };
  }

  /**
   *
   * Sign in a User
   *
   * @param payload
   * @param res
   * @returns Promise<ApiResponse>
   */
  async signIn(payload: SignIn, res: Response): Promise<ApiResponse> {
    const user = await this.userService.authenticateUser(
      payload.email,
      payload.password,
    );

    const tokens = await this.userService.getTokens(user.email, user.hash);

    res.cookie('ref', tokens.refresh_token, {
      maxAge: CONSTANTS.default_refresh_cookie_expiry,
      httpOnly: true,
    });
    res.cookie('acc', tokens.access_token, {
      maxAge: CONSTANTS.default_refresh_cookie_expiry,
      httpOnly: true,
    });

    return {
      status: true,
      message: 'User Signed In successfully',
      data: { email: user.email, token: tokens.access_token },
    };
  }

  /**
   *
   * Log out a Logged in User
   *
   * @param email
   * @param res
   * @returns Promise<ApiResponse>
   */
  async logout(email: string, res: Response): Promise<ApiResponse> {
    const user = await this.userService.getUserByEmail(email, {
      active: true,
      isDeleted: false,
    });

    if (!user) throw new NotFoundException('Invalid Credentials');

    await this.userService.updateUser(user.email, { hash: uuidv4() });

    res.clearCookie('ref', { maxAge: 0, httpOnly: true });
    res.clearCookie('acc', { maxAge: 0, httpOnly: true });

    return {
      status: true,
      message: 'User Logged Out successfully',
      data: { email: user.email },
    };
  }
}
