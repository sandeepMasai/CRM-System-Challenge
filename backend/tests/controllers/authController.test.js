const { sequelize, User } = require('../../models'); // include sequelize for setup
const jwt = require('jsonwebtoken');

let testUser, adminUser, managerUser;

beforeAll(async () => {
  // Ensure DB is connected
  await sequelize.authenticate();

  // Sync all models (drop + recreate tables for a clean test DB)
  await sequelize.sync({ force: true });

  // Create test users
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123456',
    role: 'Sales Executive',
    isActive: true,
  });

  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123456',
    role: 'Admin',
    isActive: true,
  });

  managerUser = await User.create({
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'Manager123456',
    role: 'Manager',
    isActive: true,
  });
});

afterAll(async () => {
  // Close Sequelize connection to prevent Jest open handle error
  await sequelize.close();
});
