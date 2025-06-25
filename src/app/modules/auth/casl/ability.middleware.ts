// ability.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CaslAbilityFactory } from './casl-ability.factory';
import { UserService } from '../../user/user.service';

@Injectable()
export class AbilityMiddleware implements NestMiddleware {
  constructor(
    private readonly abilityFactory: CaslAbilityFactory,
    private readonly usersService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = 1;

    if (!userId) return next();

    const user = await this.usersService.findByIdWithRoleAndPermissions(userId);

    if (!user) {
      return res.status(403).json({ message: 'User not found or invalid' });
    }

    const permissions = await this.usersService.getPermissionsByRole(
      user?.role?.id,
    );

    (req as any).ability = this.abilityFactory.createForUser(user, permissions);
    next();
  }
}
