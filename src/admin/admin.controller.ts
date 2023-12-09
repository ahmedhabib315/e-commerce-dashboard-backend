import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TokenGuard } from '@app/user/token/token.guard';
import { Roles } from '@app/user/roles/roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles('ADMIN')
  @UseGuards(TokenGuard)
  async getAllUsers() {
    return await this.adminService.getUsers();
  }
}
