import { User } from '../../app/modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const userSeeder = async (conn: DataSource) => {
  const userRepo = conn.getRepository(User);

  const data = [
    {
      password: await hashPassword('12345'),
      email: 'carvu@gmail.com',
      id: 0,
      name: 'carvu',
      accept_privacy: true,
      status: true,
    },
  ];

  await userRepo.save(data);
  console.log('User seeded');
};

const hashPassword = async (pass: string) => {
  return await bcrypt.hash(pass, 10);
};

export default userSeeder;
