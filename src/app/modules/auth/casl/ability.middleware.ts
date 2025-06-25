// ability.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CaslAbilityFactory } from './casl-ability.factory';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';

@Injectable()
export class AbilityMiddleware implements NestMiddleware {
  constructor(
    private readonly abilityFactory: CaslAbilityFactory,
    private readonly usersService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req['user'] as User;
    const userDealership = req['user_default_dealership'] as UserDealership;

    if (!user) {
      return res.status(403).json({ message: 'User not found or invalid' });
    }

    const permissions = await this.usersService.getPermissionsByRole(
      userDealership?.role_id,
    );

    (req as any).ability = this.abilityFactory.createForUser(user, permissions);
    next();
  }
}
