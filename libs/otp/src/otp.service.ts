import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { generateOtp } from 'helper/generate-otp';
import { addMinutes } from 'date-fns';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async createOtp(email: string) {
    return await this.prisma.otp.create({
      data: {
        userEmail: email,
        otp: generateOtp(),
        expiry: addMinutes(new Date(), 15),
      },
    });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const savedOtp = await this.prisma.otp.findFirst({
      where: {
        userEmail: email,
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
}
