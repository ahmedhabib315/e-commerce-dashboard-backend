import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { Response } from 'express';

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
    const roles = this.reflector.get('roles', context.getHandler());

    const { acc, ref } = request.cookies;

    if (!ref && !acc) {
      throw new UnauthorizedException('Access Denied');
    }

    const verified = await this.checkTokens(acc, ref, request, response, roles);

    if (!verified) {
      throw new UnauthorizedException('Access Denied');
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
  async checkTokens(
    acc: string,
    ref: string,
    request: any,
    response: Response,
    roles: string[],
  ) {
    try {
      const acc_token_payload = await this.userService.verifyAccessToken(acc);
      const filters: any = {
        hash: acc_token_payload.hash,
      };
      if (roles && roles.length > 0) filters.role = roles[0];
      const user = await this.userService.getUserByEmail(
        acc_token_payload.email,
        filters,
      );
      if (!user) throw new UnauthorizedException('Access Denied');
      request.user = acc_token_payload;
      return true;
    } catch (err) {
      if (err)
        try {
          if (!ref) throw new UnauthorizedException();
          const ref_token_payload =
            await this.userService.verifyRefreshToken(ref);
          const filters: any = {
            hash: ref_token_payload.hash,
          };
          if (roles && roles.length > 0) filters.role = roles[0];
          const user = await this.userService.getUserByEmail(
            ref_token_payload.email,
            filters,
          );
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
