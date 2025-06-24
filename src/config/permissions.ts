export interface IPermission {
  name: string;
  title: string;
  route: string;
}

interface PermissionConfig {
  permissions: Record<string, IPermission[]>;
}

export const PERMISSIONS: Record<string, IPermission[]> = {
  user: [
    {
      name: 'create',
      title: 'Create User',
      route: 'users.create',
    },
    {
      name: 'view',
      title: 'View User',
      route: 'users.view',
    },
    {
      name: 'update',
      title: 'Update User',
      route: 'users.update',
    },
    {
      name: 'delete',
      title: 'Delete User',
      route: 'users.delete',
    },
  ],
  role: [
    {
      name: 'role',
      title: 'Create Role',
      route: 'roles.create',
    },
    {
      name: 'read',
      title: 'View Role',
      route: 'roles.view',
    },
    {
      name: 'update',
      title: 'Update Role',
      route: 'roles.update',
    },
    {
      name: 'delete',
      title: 'Delete Role',
      route: 'roles.delete',
    },
  ],
};

export default () =>
  ({
    permissions: PERMISSIONS,
  }) as PermissionConfig;
