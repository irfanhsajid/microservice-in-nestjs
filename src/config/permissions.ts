interface Permission {
  name: string;
  guard_name: string;
  group_name: string;
}

interface PermissionConfig {
  permissions: Permission[];
}

export const PERMISSIONS: Permission[] = [
  {
    name: 'Dashboard:View',
    guard_name: 'web',
    group_name: 'Dashboard',
  },
  {
    name: 'Dashboard:Edit',
    guard_name: 'web',
    group_name: 'Dashboard',
  },
  {
    name: 'Billing Controls:View',
    guard_name: 'web',
    group_name: 'Billing Controls',
  },
  {
    name: 'Billing Controls:Edit',
    guard_name: 'web',
    group_name: 'Billing Controls',
  },
  {
    name: 'Plan Management:View',
    guard_name: 'web',
    group_name: 'Plan Management',
  },
  {
    name: 'Plan Management:Edit',
    guard_name: 'web',
    group_name: 'Plan Management',
  },
  {
    name: 'Role Management:View',
    guard_name: 'web',
    group_name: 'Role Management',
  },
  {
    name: 'Role Management:Edit',
    guard_name: 'web',
    group_name: 'Role Management',
  },
  {
    name: 'User Management:View',
    guard_name: 'web',
    group_name: 'User Management',
  },
  {
    name: 'User Management:Edit',
    guard_name: 'web',
    group_name: 'User Management',
  },
  {
    name: 'Dealer Management:View',
    guard_name: 'web',
    group_name: 'Dealer Management',
  },
  {
    name: 'Dealer Management:Edit',
    guard_name: 'web',
    group_name: 'Dealer Management',
  },
];

export default () =>
  ({
    permissions: PERMISSIONS,
  }) as PermissionConfig;
