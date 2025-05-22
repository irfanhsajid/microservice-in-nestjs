/* eslint-disable @typescript-eslint/require-await */
import { DataSource } from 'typeorm';

const userSeeder = async (conn: DataSource) => {
  // const userRepo = conn.getRepository(User);
  // const data: User[] = [
  //   {
  //     id: 1,
  //     firstNames: 'John',
  //     lastName: 'Doe',
  //     isActive: true,
  //   },
  // ];
  // await userRepo.save(data);
  console.log('User seeded', conn);
};

export default userSeeder;
