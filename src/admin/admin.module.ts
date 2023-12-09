import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@app/prisma';
import { UserService } from '@app/user';

@Module({
  controllers: [AdminController],
  providers: [AdminService, JwtService, UserService, PrismaService],
})
export class AdminModule {}
