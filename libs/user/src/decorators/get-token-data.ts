import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetTokenData = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    console.log('::::request.user:::',request.user);
    if (!data) return request.user;
    return request.user[data];
  },
);