import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { generateOtp } from 'helper/generate-otp';
import { addMinutes } from 'date-fns';
import { Otp, User } from '@prisma/client';
import { CONSTANTS } from 'common/constants';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *
   * Create a new OTP for Specified User
   *
   * @param email
   * @returns Promise<Otp>
   */
  async createOtp(email: string): Promise<Otp> {
    const oldOtps = await this.getOtps({ email });

    if (oldOtps && oldOtps.length > 0) {
      await this.prisma.otp.updateMany({
        where: {
          email,
        },
        data: {
          expiry: new Date(),
        },
      });
    }

    return await this.prisma.otp.create({
      data: {
        email: email,
        otp: generateOtp(),
        expiry: addMinutes(new Date(), CONSTANTS.otp_expiry_minutes),
      },
    });
  }

  /**
   *
   * Verify the provided OTP and return status
   *
   * @param email
   * @param otp
   * @returns Promise<boolean>
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const savedOtp = await this.prisma.otp.findFirst({
      where: {
        email,
        otp: otp,
        expiry: {
          gt: new Date(),
        },
      },
    });

    if (savedOtp) {
      await this.prisma.otp.update({
        where: {
          id: savedOtp.id,
        },
        data: {
          expiry: new Date(),
        },
      });
      return true;
    }
    return false;
  }

  /**
   * 
   * Get Old OTPs according to filters
   * 
   * @param whereOptions 
   * @returns 
   */
  async getOtps(whereOptions: any): Promise<Otp[]> {
    return await this.prisma.otp.findMany({
      where: whereOptions,
    });
  }
}
