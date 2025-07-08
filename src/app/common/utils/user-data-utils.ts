import { UserDealership } from 'src/app/modules/dealership/entities/user-dealership.entity';
import { User } from 'src/app/modules/user/entities/user.entity';

export const extractUserDealership = (req: any): UserDealership => {
  return req['user_default_dealership'] as UserDealership;
};

export const extractUser = (req: any): User => {
  return req['user'] as User;
};
