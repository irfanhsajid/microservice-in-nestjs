interface Permission {
  name: string;
  guard_name: string;
  group_name: string;
  created_at: Date;
  updated_at: Date;
}

interface PermissionConfig {
  permissions: Permission[];
}

export const PERMISSIONS: Permission[] = [
  {
    name: 'Dashboard:View',
    guard_name: 'web',
    group_name: 'Dashboard',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Dashboard:Edit',
    guard_name: 'web',
    group_name: 'Dashboard',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Billing Controls:View',
    guard_name: 'web',
    group_name: 'Billing Controls',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Billing Controls:Edit',
    guard_name: 'web',
    group_name: 'Billing Controls',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Plan Management:View',
    guard_name: 'web',
    group_name: 'Plan Management',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Plan Management:Edit',
    guard_name: 'web',
    group_name: 'Plan Management',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Role Management:View',
    guard_name: 'web',
    group_name: 'Role Management',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Role Management:Edit',
    guard_name: 'web',
    group_name: 'Role Management',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'User Management:View',
    guard_name: 'web',
    group_name: 'User Management',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'User Management:Edit',
    guard_name: 'web',
    group_name: 'User Management',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Dealer Management:View',
    guard_name: 'web',
    group_name: 'Dealer Management',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Dealer Management:Edit',
    guard_name: 'web',
    group_name: 'Dealer Management',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export default () =>
  ({
    permissions: PERMISSIONS,
  }) as PermissionConfig;
