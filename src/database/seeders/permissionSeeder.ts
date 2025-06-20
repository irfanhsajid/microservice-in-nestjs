import { DataSource } from 'typeorm';
import { Permission } from '../../app/modules/role/entities/permission.entity';
import permissionConfig from '../../config/permission';

const permissionSeeder = async (conn: DataSource) => {
  const permissionRepo = conn.getRepository(Permission);

  // Get permissions from config
  const { permissions } = permissionConfig();

  // Map permissions to match entity structure
  const permissionsData = permissions.map((permission) => ({
    name: permission.name,
    guard_name: permission.guard_name,
    group_name: permission.group_name,
    created_at: permission.created_at,
    updated_at: permission.updated_at,
  }));

  // Check for existing permissions to avoid duplicates
  for (const permission of permissionsData) {
    const existingPermission = await permissionRepo.findOne({
      where: { name: permission.name },
    });

    if (!existingPermission) {
      await permissionRepo.save(permission);
    }
  }

  console.log('Permissions seeded');
};

export default permissionSeeder;
