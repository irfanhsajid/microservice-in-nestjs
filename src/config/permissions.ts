export default () => ({
  permissions: {
    user: [
      { name: 'create:user', title: 'Create User', route: '/users' },
      { name: 'read:user', title: 'Read User', route: '/users/:id' },
    ],
    post: [{ name: 'create:post', title: 'Create Post', route: '/posts' }],
  },
  rolePermissions: {
    admin: ['create:user', 'read:user', 'create:post'], // [Action:Subject] & must be singular
    buyer: ['read:user'],
    seller: ['create:post'],
  },
});
