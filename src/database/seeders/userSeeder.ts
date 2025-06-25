import {
  User,
  UserAccountType,
} from '../../app/modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDealership } from '../../app/modules/dealership/entities/user-dealership.entity';
import { Role } from '../../app/modules/roles/entities/role.entity';

const userSeeder = async (conn: DataSource) => {
  const userRepo = conn.getRepository(User);
  const userDealershipRepo = conn.getRepository(UserDealership);
  const roleRepo = conn.getRepository(Role);

  // Step 1: Create user
  const data = [
    {
      password: await hashPassword('12345'),
      email: 'carvu@gmail.com',
      id: 0,
      name: 'carvu',
      accept_privacy: true,
      status: true,
      email_verified_at: new Date(),
      account_type: UserAccountType.MODERATOR,
    },
  ];

  await userRepo.save(data);

  const user = await userRepo.findOne({
    where: { email: 'carvu@gmail.com' },
  });

  // Step 2: Create user dealership

  // Get admin role id
  const role = await roleRepo.findOne({
    where: { name: 'admin' },
  });
  await userDealershipRepo.save({
    role_id: role?.id,
    user_id: user?.id,
  });
  console.log('User and User dealership seeded');
};

const hashPassword = async (pass: string) => {
  return await bcrypt.hash(pass, 10);
};

export default userSeeder;
