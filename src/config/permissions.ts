export default () => ({
  permissions: {
    user: [
      { name: 'create:user', title: 'Create User', route: '/users' },
      { name: 'read:user', title: 'Read User', route: '/users/:id' },
    ],
    post: [{ name: 'create:post', title: 'Create Post', route: '/posts' }],
  },
  rolePermissions: {
    super_admin: ['create:user', 'read:user', 'create:post'], // [Action:Subject] & must be singular
    wholesale_dealer: ['read:user'],
    general_dealer: ['read:user', 'create:post'],
    other_dealer: ['create:post'],
    user: ['read:user'],
  },
});
