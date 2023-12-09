import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Get User Data from Token
 */
export const GetTokenData = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);