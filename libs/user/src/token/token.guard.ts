import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /**
   * 
   * Validate Request for end point
   * 
   * @param context 
   * @returns 
   */
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { acc, ref } = request.cookies;

    if (!ref && !acc) {
      throw new UnauthorizedException('Please Login to continue');
    }

    const verified = await this.checkTokens(acc, ref, request, response);

    if (!verified) {
      throw new UnauthorizedException('Please Login to continue');
    }
    return true;
  }

  /**
   * 
   * Verify Access and Refresh Tokens on request
   * 
   * @param acc 
   * @param ref 
   * @param request 
   * @param response 
   * @returns 
   */
  async checkTokens(acc, ref, request, response) {
    try {
      const acc_token_payload = await this.userService.verifyAccessToken(acc);
      const user = await this.userService.getUser(acc_token_payload.email, {
        hash: acc_token_payload.hash,
      });
      if (!user) throw new UnauthorizedException();
      request.user = acc_token_payload;
      return true;
    } catch (err) {
      if (err)
        try {
          if (!ref) throw new UnauthorizedException();
          const ref_token_payload =
            await this.userService.verifyRefreshToken(ref);
          const user = await this.userService.getUser(ref_token_payload.email, {
            hash: ref_token_payload.hash,
          });
          if (!user) throw new UnauthorizedException();
          const access_token: any = await this.userService.getAccessToken(
            user.email,
            user.hash,
          );
          response.cookie('acc', access_token);
          request.user = ref_token_payload;
          return true;
        } catch (error) {
          return false;
        }
    }
  }
}
