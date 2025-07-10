import {
  User,
  UserAccountType,
} from '../../app/modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  UserDealership,
  UserDealershipStatus,
} from '../../app/modules/dealership/entities/user-dealership.entity';

const userSeeder = async (conn: DataSource) => {
  const userRepo = conn.getRepository(User);
  const userDealershipRepo = conn.getRepository(UserDealership);

  // Step 1: Create user
  const data = [
    {
      password: await hashPassword('Password@123'),
      email: 'carvu@gmail.com',
      name: 'carvu',
      accept_privacy: true,
      status: true,
      email_verified_at: new Date(),
      account_type: UserAccountType.MODERATOR,
      role_id: 1,
    },

    {
      password: await hashPassword('Password@123'),
      email: 'dealer@gmail.com',
      name: 'Dealer',
      accept_privacy: true,
      status: true,
      email_verified_at: new Date(),
      account_type: UserAccountType.DEALER,
      role_id: 2,
    },
  ];

  const users = await userRepo.save(data);
  const userDealershipsData: UserDealership[] = [];
  for (const user of users) {
    userDealershipsData.push({
      user_id: user.id,
      is_default: true,
      role_id: user.role_id,
      status: UserDealershipStatus.APPROVED,
    } as UserDealership);

    await userDealershipRepo.save(userDealershipsData);
  }

  console.log('User seeded');
};

const hashPassword = async (pass: string) => {
  return await bcrypt.hash(pass, 10);
};

export default userSeeder;
