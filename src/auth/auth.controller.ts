import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignIn, Signup, VerifyOtp } from './dto/auth.dto';
import { Response } from 'express';
import { TokenGuard } from '@app/user/token/token.guard';
import { GetTokenData } from '@app/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-user')
  async createUser(@Body() data: Signup) {
    return await this.authService.createUser(data);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtp) {
    return await this.authService.verifyOtp(data);
  }

  @Post('sign-in')
  async signIn(@Body() data: SignIn, @Res({ passthrough: true }) response: Response) {
    return await this.authService.signIn(data, response);
  }

  @Post('logout')
  @UseGuards(TokenGuard)
  async logout(@GetTokenData('email') email: string, @Res({ passthrough: true }) response: Response){
    return await this.authService.logout(email, response);
  }
}
