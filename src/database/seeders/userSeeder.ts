import { DataSource } from 'typeorm';
import { User } from '../../app/Models/User';

const userSeeder = async (conn: DataSource) => {
  const userRepo = conn.getRepository(User);
  const data: User[] = [
    {
      id: 1,
      firstNames: 'John',
      lastName: 'Doe',
      isActive: true,
    },
  ];
  await userRepo.save(data);
  console.log('User seeded');
};

export default userSeeder;
