import { dataSource } from '../driver';
import permissionSeeder from './permissionSeeder';
import userSeeder from './userSeeder';

dataSource.initialize().then(async (conn) => {
  await userSeeder(conn);
  await permissionSeeder(conn);
});
