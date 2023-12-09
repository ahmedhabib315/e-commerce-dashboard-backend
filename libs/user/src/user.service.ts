import { PrismaService } from '@app/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUser } from './dto/user.dto';
import { decryptData, encryptData } from 'helper/encryption';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { CONSTANTS } from 'common/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   * Get User Details according to filters
   *
   * @param email
   * @param whereOptions
   * @returns
   */
  async getUser(email: string, whereOptions?: any): Promise<User> {
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

  /**
   *
   * Create User
   *
   * @param payload
   * @returns
   */
  async createUser(payload: CreateUser): Promise<User> {
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

  /**
   *
   * Update provided fields in Users
   *
   * @param email
   * @param data
   * @returns
   */
  async updateUser(email: string, data: any): Promise<User> {
    return await this.prisma.user.update({
      where: {
        email: email,
      },
      data: data,
    });
  }

  /**
   *
   * Authenticate User On Login
   *
   * @param email
   * @param password
   * @returns Promise<any>
   */
  async authenticateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
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

  /**
   *
   * Get Access Token
   *
   * @param email
   * @param hash
   * @param exp
   * @returns Promise<any>
   */
  async getAccessToken(
    email: string,
    hash: string,
    exp = CONSTANTS.default_jwt_access_expiry,
  ): Promise<any> {
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

  /**
   *
   * Get Refresh Token
   *
   * @param email
   * @param hash
   * @param exp
   * @returns Promise<any>
   */
  async getRefreshToken(
    email: string,
    hash: string,
    exp = CONSTANTS.default_jwt_refresh_expiry,
  ): Promise<any> {
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

  /**
   *
   * Verify Access Token and return payload
   *
   * @param token
   * @returns Promise<any>
   */
  async verifyAccessToken(token: string): Promise<any> {
    return this.jwtService.verify(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  /**
   *
   * Verify Refresh Token and return payload
   *
   * @param token
   * @returns Promise<any>
   */
  async verifyRefreshToken(token: string): Promise<any> {
    return this.jwtService.verify(token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
  }

  /**
   *
   * Get Access and Refresh Token in Object
   *
   * @param email
   * @param hash
   * @returns Promise<any>
   */
  async getTokens(email: string, hash: string): Promise<any> {
    return {
      refresh_token: await this.getRefreshToken(email, hash),
      access_token: await this.getAccessToken(email, hash),
    };
  }
}
