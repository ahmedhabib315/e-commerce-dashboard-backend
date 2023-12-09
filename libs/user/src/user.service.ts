import { PrismaService } from '@app/prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUser } from './dto/user.dto';
import { decryptData, encryptData } from 'helper/encryption';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async getUser(email: string, whereOptions?: any) {
    if (whereOptions) {
      return await this.prisma.user.findFirst({
        where: {
          ...whereOptions,
          email: email,
        },
      });
    }
    return await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
  }

  async createUser(payload: CreateUser) {
    const hashed_password = await encryptData(payload.password);

    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        password: hashed_password,
        active: false,
      },
    });

    delete user.password;

    return user;
  }

  async updateUser(email: string, data: any) {
    return await this.prisma.user.update({
      where: {
        email: email,
      },
      data: data,
    });
  }

  async authenticateUser(email: string, password: string) {
    const user = await await this.prisma.user.findFirst({
      where: {
        email: email,
        active: true,
      },
    });

    if (!user) throw new NotFoundException('Invalid Credentials');

    const verifiedPassword = await decryptData(password, user.password);

    if (!verifiedPassword) throw new NotFoundException('Invalid Credentials');

    return { email: user.email, hash: user.hash };
  }

  async getAccessToken(email: string, hash: string, exp = '10m') {
    return await this.jwtService.signAsync(
      {
        email,
        hash,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: exp,
      },
    );
  }

  async getRefreshToken(email: string, hash: string, exp = '1h') {
    return await this.jwtService.signAsync(
      {
        email,
        hash,
      },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: exp,
      },
    );
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  async verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
  }

  async getTokens(email: string, hash: string) {
    return {
      refresh_token: this.getRefreshToken(email, hash),
      access_token: this.getAccessToken(email, hash)
    }
  }
}
