import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { CHECK_ABILITY } from './check-ability.decorator';
import { AppAbility } from './casl-ability.factory';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { action, subject } =
      this.reflector.get(CHECK_ABILITY, context.getHandler()) || {};

    if (!action || !subject) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const ability: AppAbility = req.ability;

    if (!ability) {
      return false;
    }

    return ability.can(action, subject);
  }
}
