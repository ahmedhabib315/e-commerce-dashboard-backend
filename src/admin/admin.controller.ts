import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TokenGuard } from '@app/user/token/token.guard';
import { Roles } from '@app/user/roles/roles.decorator';
import { Signup } from 'src/auth/dto/auth.dto';
import { DeleteUser } from './dto/admin.dto';
import { GetTokenData } from '@app/user';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles('ADMIN')
  @UseGuards(TokenGuard)
  async getAllUsers() {
    return await this.adminService.getUsers();
  }

  @Post('add-user')
  @Roles('ADMIN')
  @UseGuards(TokenGuard)
  async addUser(@Body() data: Signup) {
    return await this.adminService.addUser(data);
  }

  @Post('delete-user')
  @Roles('ADMIN')
  @UseGuards(TokenGuard)
  async deleteUser(@Body() data: DeleteUser, @GetTokenData('email') email: string) {
    return await this.adminService.deleteUser(data, email);
  }
}
