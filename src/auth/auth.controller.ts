import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateOtp, SignIn, Signup, VerifyOtp } from './dto/auth.dto';
import { Response } from 'express';
import { GetTokenData, TokenGuard } from '@app/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-user')
  async createUser(@Body() data: Signup) {
    return await this.authService.createUser(data);
  }

  @Post('generate-otp')
  async regenerateOtp(@Body() data: GenerateOtp) {
    return await this.authService.generateOtp(data);
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
