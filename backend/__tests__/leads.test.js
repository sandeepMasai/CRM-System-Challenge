const request = require('supertest');
const { app } = require('../server');
const { User, Lead } = require('../models');
const jwt = require('jsonwebtoken');

describe('Leads API', () => {
    let authToken;
    let adminUser;
    let managerUser;
    let salesUser;
    let testLead;

    beforeAll(async () => {
        // Create test users
        adminUser = await User.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Admin'
        });

        managerUser = await User.create({
            name: 'Test Manager',
            email: 'manager@test.com',
            password: 'password123',
            role: 'Manager'
        });

        salesUser = await User.create({
            name: 'Test Sales',
            email: 'sales@test.com',
            password: 'password123',
            role: 'Sales Executive'
        });

        // Generate tokens
        authToken = jwt.sign(
            { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
            process.env.JWT_SECRET || 'test_secret',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        // Clean up test data
        await Lead.destroy({ where: {}, force: true });
        await User.destroy({ where: { email: ['admin@test.com', 'manager@test.com', 'sales@test.com'] } });
    });

    describe('POST /api/leads', () => {
        it('should create a new lead (Admin)', async () => {
            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Lead',
                    email: 'lead@test.com',
                    phone: '1234567890',
                    company: 'Test Company',
                    status: 'New',
                    source: 'Website',
                    assignedToId: salesUser.id
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('lead');
            expect(response.body.lead.name).toBe('Test Lead');
            expect(response.body.lead.email).toBe('lead@test.com');
            testLead = response.body.lead;
        });

        it('should reject lead creation without authentication', async () => {
            const response = await request(app)
                .post('/api/leads')
                .send({
                    name: 'Test Lead',
                    email: 'lead2@test.com'
                });

            expect(response.status).toBe(401);
        });

        it('should reject lead creation with invalid email', async () => {
            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Lead',
                    email: 'invalid-email'
                });

            expect(response.status).toBe(400);
        });

        it('should reject lead creation with invalid status', async () => {
            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Lead',
                    email: 'lead3@test.com',
                    status: 'InvalidStatus'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/leads', () => {
        it('should get all leads', async () => {
            const response = await request(app)
                .get('/api/leads')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('leads');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.leads)).toBe(true);
        });

        it('should filter leads by status', async () => {
            const response = await request(app)
                .get('/api/leads?status=New')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            if (response.body.leads.length > 0) {
                expect(response.body.leads[0].status).toBe('New');
            }
        });

        it('should paginate leads', async () => {
            const response = await request(app)
                .get('/api/leads?page=1&limit=5')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
        });
    });

    describe('GET /api/leads/:id', () => {
        it('should get a lead by id', async () => {
            if (!testLead) {
                // Create a lead if testLead doesn't exist
                const createResponse = await request(app)
                    .post('/api/leads')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        name: 'Get Test Lead',
                        email: 'getlead@test.com',
                        status: 'New'
                    });
                testLead = createResponse.body.lead;
            }

            const response = await request(app)
                .get(`/api/leads/${testLead.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.lead.id).toBe(testLead.id);
        });

        it('should return 404 for non-existent lead', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app)
                .get(`/api/leads/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/leads/:id', () => {
        it('should update a lead', async () => {
            if (!testLead) {
                const createResponse = await request(app)
                    .post('/api/leads')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        name: 'Update Test Lead',
                        email: 'updatelead@test.com',
                        status: 'New'
                    });
                testLead = createResponse.body.lead;
            }

            const response = await request(app)
                .put(`/api/leads/${testLead.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    status: 'Contacted',
                    name: 'Updated Lead Name'
                });

            expect(response.status).toBe(200);
            expect(response.body.lead.status).toBe('Contacted');
            expect(response.body.lead.name).toBe('Updated Lead Name');
        });

        it('should reject invalid status update', async () => {
            if (!testLead) return;

            const response = await request(app)
                .put(`/api/leads/${testLead.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    status: 'InvalidStatus'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/leads/:id', () => {
        it('should delete a lead (Admin only)', async () => {
            // Create a lead to delete
            const createResponse = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Delete Test Lead',
                    email: 'deletelead@test.com',
                    status: 'New'
                });

            const leadToDelete = createResponse.body.lead;

            const response = await request(app)
                .delete(`/api/leads/${leadToDelete.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('deleted');

            // Verify lead is deleted
            const getResponse = await request(app)
                .get(`/api/leads/${leadToDelete.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(getResponse.status).toBe(404);
        });
    });
});

