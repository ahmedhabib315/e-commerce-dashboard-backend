import { UserService } from '@app/user';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async getUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }
}
