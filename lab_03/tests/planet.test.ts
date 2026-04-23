import request from 'supertest';
import app from '../src/app';
import { PlanetStorage } from '../src/storage/planet.storage';

const validPlanet = {
    name: 'Earth',
    description: 'Our home',
    type: 'Terrestrial',
    massEarth: 1
};

const heavyPlanet = {
    name: 'Jupiter',
    type: 'Gas Giant',
    massEarth: 317.8
};

describe('Planet REST API Integration Tests', () => {
    // ОЧИЩЕННЯ БАЗИ ПЕРЕД КОЖНИМ ТЕСТОМ (Вимога Завдання 6)
    beforeEach(() => {
        PlanetStorage.reset();
    });

    describe('POST /api/planets', () => {
        it('повинен створити нову планету і повернути статус 201', async () => {
            const res = await request(app)
                .post('/api/planets')
                .send(validPlanet)
                .expect(201);

            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe(validPlanet.name);
            expect(res.body).toHaveProperty('createdAt');
        });

        it('повинен повернути 400, якщо дані невалідні (неправильний type)', async () => {
            const res = await request(app)
                .post('/api/planets')
                .send({ ...validPlanet, type: 'InvalidType' })
                .expect(400);

            expect(res.body.message).toBe('Помилка валідації даних');
        });

        it('повинен повернути 400, якщо маса менша нуля', async () => {
            await request(app)
                .post('/api/planets')
                .send({ ...validPlanet, massEarth: -10 })
                .expect(400);
        });
    });

    describe('GET /api/planets', () => {
        it('повинен повернути порожній масив, якщо база чиста', async () => {
            const res = await request(app).get('/api/planets').expect(200);
            expect(res.body).toEqual([]);
        });

        it('повинен повернути всі створені планети', async () => {
            await request(app).post('/api/planets').send(validPlanet);
            await request(app).post('/api/planets').send(heavyPlanet);

            const res = await request(app).get('/api/planets').expect(200);
            expect(res.body).toHaveLength(2);
        });

        it('повинен фільтрувати планети за типом (query parameter: type)', async () => {
            await request(app).post('/api/planets').send(validPlanet);
            await request(app).post('/api/planets').send(heavyPlanet);

            const res = await request(app).get('/api/planets?type=Gas Giant').expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Jupiter');
        });

        it('повинен фільтрувати планети за мінімальною масою (query parameter: minMassEarth)', async () => {
            await request(app).post('/api/planets').send(validPlanet);
            await request(app).post('/api/planets').send(heavyPlanet);

            const res = await request(app).get('/api/planets?minMassEarth=100').expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Jupiter');
        });
    });

    describe('GET /api/planets/heavy', () => {
        it('повинен повернути лише планети з масою >= 10', async () => {
            await request(app).post('/api/planets').send(validPlanet);
            await request(app).post('/api/planets').send(heavyPlanet);

            const res = await request(app).get('/api/planets/heavy').expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Jupiter');
        });
    });

    describe('GET /api/planets/:id', () => {
        it('повинен повернути планету за правильним ID', async () => {
            const createRes = await request(app).post('/api/planets').send(validPlanet);
            const planetId = createRes.body.id;

            const res = await request(app).get(`/api/planets/${planetId}`).expect(200);
            expect(res.body.id).toBe(planetId);
        });

        it('повинен повернути 404, якщо ID не існує', async () => {
            await request(app).get('/api/planets/fake-id-123').expect(404);
        });
    });

    describe('PATCH /api/planets/:id', () => {
        it('повинен успішно оновити лише передані поля', async () => {
            const createRes = await request(app).post('/api/planets').send(validPlanet);
            const planetId = createRes.body.id;

            const res = await request(app)
                .patch(`/api/planets/${planetId}`)
                .send({ name: 'Earth 2.0' })
                .expect(200);

            expect(res.body.name).toBe('Earth 2.0');
            expect(res.body.type).toBe('Terrestrial');
        });

        it('повинен повернути 404 при спробі оновити неіснуючу планету', async () => {
            await request(app).patch('/api/planets/fake-id').send({ name: 'Nova' }).expect(404);
        });
    });

    describe('DELETE /api/planets/:id', () => {
        it('повинен видалити планету і повернути статус 204 No Content', async () => {
            const createRes = await request(app).post('/api/planets').send(validPlanet);
            const planetId = createRes.body.id;

            await request(app).delete(`/api/planets/${planetId}`).expect(204);

            await request(app).get(`/api/planets/${planetId}`).expect(404);
        });

        it('повинен повернути 404 при спробі видалити неіснуючу планету', async () => {
            await request(app).delete('/api/planets/fake-id').expect(404);
        });
    });
});