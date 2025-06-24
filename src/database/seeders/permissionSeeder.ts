import { Permission } from '../../app/modules/roles/entities/permission.entity';
import permissionConfig from '../../config/permissions';
import { DataSource } from 'typeorm';

const permissionSeeder = async (conn: DataSource) => {
  const permissionRepo = conn.getRepository(Permission);
  const { permissions } = permissionConfig();
  for (const [parent, childs] of Object.entries(permissions)) {
    const parentPermission = await permissionRepo.save({
      name: parent,
      title: parent?.slice(0, 1).toUpperCase() + parent?.slice(1),
      route: parent,
    });

    const childPermissions = childs.map((child) =>
      permissionRepo.create({
        name: child.name,
        title: child.title,
        route: child.route,
        parent_permission: parentPermission,
      }),
    );

    await permissionRepo.save(childPermissions);
  }

  console.log('Permission seeded');
};

export default permissionSeeder;
