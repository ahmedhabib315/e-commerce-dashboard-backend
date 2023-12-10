import { UserService } from '@app/user';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Signup } from 'src/auth/dto/auth.dto';
import { DeleteUser } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async getUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  async addUser(payload: Signup) {
    const userExists = await this.userService.getUserByEmail(payload.email);

    if (userExists) throw new BadRequestException('Email already exists');

    const newUser = await this.userService.createUser(payload, true);

    return {
      status: true,
      message: 'User created successfully',
      data: { newUser },
    };
  }

  async deleteUser(payload: DeleteUser, ownEmail: string) {
    const userExists = await this.userService.getUserByEmail(payload.email);
    console.log('::::ownEmail::::::', ownEmail);

    if (!userExists) throw new NotFoundException('User does not exist');

    if (userExists.email === ownEmail)
      throw new UnauthorizedException('Cannot delete own profile');

    const updatedUser = await this.userService.updateUser(payload.email, {
      isDeleted: true,
    });

    return {
      status: true,
      message: 'User Deleted successfully',
      data: { updatedUser },
    };
  }
}
