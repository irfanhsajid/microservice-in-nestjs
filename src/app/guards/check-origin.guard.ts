import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  applyDecorators,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { EntityManager } from 'typeorm';

// Custom CORS exception
export class CorsOriginException extends HttpException {
  constructor() {
    super('Invalid CORS origin', HttpStatus.FORBIDDEN);
  }
}

@Injectable()
export class CheckOriginGuard implements CanActivate {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    const origin =
      request.get('origin') ||
      request.get('referer')?.split('/').slice(0, 3).join('/');

    // const allowedOrigins =
    //   this.reflector.get<string[]>('allowedOrigins', context.getHandler()) ||
    //   this.reflector.get<string[]>('allowedOrigins', context.getClass()) ||
    //   [];

    // console.log('Request headers:', request.headers);
    // console.log('Current origin:', origin);
    // console.log('Allowed origins:', allowedOrigins);

    // if (!origin || !allowedOrigins.includes(origin)) {
    //   throw new CorsOriginException();
    // }

    return true;
  }
}

export function CheckOrigin(origins: string[]) {
  return applyDecorators(
    // SetMetadata('allowedOrigins', origins),
    UseGuards(CheckOriginGuard),
  );
}
