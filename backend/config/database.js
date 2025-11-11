// backend/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const isCloudDatabase =
    process.env.DB_HOST &&
    (
        process.env.DB_HOST.includes('aivencloud.com') ||
        process.env.DB_HOST.includes('amazonaws.com') ||
        process.env.DB_HOST.includes('azure.com') ||
        process.env.DB_SSL === 'true'
    );

const dialectOptions = {};

if (isCloudDatabase) {
    dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false, // ✅ safer local fallback
    };
}

const sequelize = new Sequelize(
    process.env.DB_NAME || 'crm_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

// Function to test DB connection
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        if (error.original?.code === 'ECONNREFUSED') {
            console.error('🔴 Check if PostgreSQL is running and accepting connections.');
        }
        process.exit(1);
    }
}

module.exports = { sequelize, connectDB };
