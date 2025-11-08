const { User } = require('../models');
const { sequelize } = require('../config/database');
require('dotenv').config();

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: 'admin@crm.com' } });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@crm.com',
            password: 'admin123', // Change this in production!
            role: 'Admin',
            isActive: true
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@crm.com');
        console.log('Password: admin123');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();

