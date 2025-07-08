export default () => ({
  permissions: {
    user: [
      { name: 'create:user', title: 'Create User', route: '/users' },
      { name: 'read:user', title: 'Read User', route: '/users/:id' },
      { name: 'update:user', title: 'Update User', route: '/users/:id' },
      { name: 'delete:user', title: 'Delete User', route: '/users/:id' },
    ],
    post: [{ name: 'create:post', title: 'Create Post', route: '/posts' }],
    dealership: [
      {
        name: 'create:dealership',
        title: 'Create Dealership',
        route: '/dealerships',
      },
      {
        name: 'read:dealership',
        title: 'Read Dealership',
        route: '/dealerships/:id',
      },
      {
        name: 'update:dealership',
        title: 'Update Dealership',
        route: '/dealerships/:id',
      },
      {
        name: 'delete:dealership',
        title: 'Delete Dealership',
        route: '/dealerships/:id',
      },
    ],
  },
  rolePermissions: {
    super_admin: [
      'create:user',
      'read:user',
      'create:post',
      'create:dealership',
      'read:dealership',
      'update:dealership',
      'delete:dealership',
      'update:user',
      'delete:user',
    ], // [Action:Subject] & must be singular
    wholesale_dealer: ['read:user'],
    general_dealer: ['read:user', 'create:post'],
    other_dealer: ['create:post', 'read:user'],
    user: ['read:user'],
  },
});
