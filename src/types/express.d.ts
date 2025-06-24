import { UserDealership } from 'src/app/modules/dealership/entities/user-dealership.entity';

declare global {
  namespace Express {
    interface Request {
      user_default_dealership?: UserDealership;
    }
  }
}
