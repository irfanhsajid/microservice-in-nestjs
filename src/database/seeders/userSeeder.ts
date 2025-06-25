import {
  User,
  UserAccountType,
} from '../../app/modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDealership, UserDealershipStatus } from '../../app/modules/dealership/entities/user-dealership.entity';

const userSeeder = async (conn: DataSource) => {
  const userRepo = conn.getRepository(User);
  const userDealershipRepo = conn.getRepository(UserDealership);

  const data = [
    {
      password: await hashPassword('12345'),
      email: 'carvu@gmail.com',
      name: 'carvu',
      accept_privacy: true,
      status: true,
      email_verified_at: new Date(),
      account_type: UserAccountType.MODERATOR,
    },

    {
      password: await hashPassword('12345'),
      email: 'dealer@gmail.com',
      name: 'Dealer',
      accept_privacy: true,
      status: true,
      email_verified_at: new Date(),
      account_type: UserAccountType.DEALER,
    },
  ];

  const users = await userRepo.save(data);
  const userDealershipsData: UserDealership[] = [];
  for (const user of users) {
    userDealershipsData.push({
      user_id: user.id,
      dealership_id: null,
      is_default: true,
      role_id: 1,
      status: UserDealershipStatus.APPROVED,
    } as UserDealership);
  }
  await userDealershipRepo.save(userDealershipsData);

  console.log('User seeded');
};

const hashPassword = async (pass: string) => {
  return await bcrypt.hash(pass, 10);
};

export default userSeeder;
