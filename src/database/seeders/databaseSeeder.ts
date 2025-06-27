import { dataSource } from '../driver';
import permissionSeeder from './permissionSeeder';
import userSeeder from './userSeeder';

dataSource.initialize().then(async (conn) => {
  await permissionSeeder(conn);
  await userSeeder(conn);
});
