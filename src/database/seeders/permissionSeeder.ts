import { DataSource } from 'typeorm';
import { Permission } from '../../app/modules/roles/entities/permission.entity';
import { Role, RoleStatus } from '../../app/modules/roles/entities/role.entity';
import { RoleHasPermissions } from '../../app/modules/roles/entities/role_has_permissions.entity';
import permissionConfig from '../../config/permissions';

const permissionSeeder = async (conn: DataSource) => {
  const permissionRepo = conn.getRepository(Permission);
  const roleRepo = conn.getRepository(Role);
  const roleHasPermissionRepo = conn.getRepository(RoleHasPermissions);

  const { permissions, rolePermissions } = permissionConfig();

  const allPermissionsMap = new Map<string, Permission>();

  // 🔹 Step 1: Create Permissions (parent + child)
  for (const [parent, childs] of Object.entries(permissions)) {
    const parentPermission = await permissionRepo.save(
      permissionRepo.create({
        name: parent,
        title: parent[0].toUpperCase() + parent.slice(1),
        route: parent,
      }),
    );

    for (const child of childs) {
      const childPerm = permissionRepo.create({
        name: child.name,
        title: child.title,
        route: child.route,
        parent_permission: parentPermission,
      });
      const saved = await permissionRepo.save(childPerm);
      allPermissionsMap.set(saved.name, saved); // Save for role binding
    }
  }

  // 🔹 Step 2: Create Roles
  const roleEntities: Record<string, Role> = {};
  for (const roleName of Object.keys(rolePermissions)) {
    const role = roleRepo.create({
      name: roleName,
      status: RoleStatus.ACTIVE, // Use enum instead of string
    });
    const savedRole = await roleRepo.save(role);
    roleEntities[roleName] = savedRole;
  }

  // 🔹 Step 3: Bind Permissions to Roles
  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const role = roleEntities[roleName];
    const mappings = permissionNames.map((permName) => {
      const perm = allPermissionsMap.get(permName);
      if (!perm) throw new Error(`Permission not found: ${permName}`);
      return roleHasPermissionRepo.create({
        role,
        permission: perm,
      });
    });
    await roleHasPermissionRepo.save(mappings);
  }

  console.log('Permissions and roles seeded');
};

export default permissionSeeder;
