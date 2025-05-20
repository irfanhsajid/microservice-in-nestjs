import { dataSource } from '../driver';
import userSeeder from './userSeeder';

dataSource.initialize().then(async (conn) => {
  await userSeeder(conn);
});
