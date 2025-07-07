import { UserDealership } from 'src/app/modules/dealership/entities/user-dealership.entity';

export const extractUserDealership = (req: any): UserDealership => {
  return req['user_default_dealership'] as UserDealership;
};
