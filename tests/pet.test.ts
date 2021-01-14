import request from 'supertest';
import app from '@/app';
import { getPool } from '@/common/db';

describe('/api/pets endpoint test', () => {
    afterAll(async () => {
        const pool = getPool();

        // cleanup
        await pool.query(`DELETE FROM Pet`);
        await pool.query(`ALTER TABLE Pet AUTO_INCREMENT=1`);

        await pool.end();
    });

    it('should retrieve an empty list of pets', async () => {
        const response = await request(app).get('/api/pets');
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual([]);
    });

    it('should successfully create multiple new pets', async () => {
        const createFooResponse = await request(app).post('/api/pets').send({
            species: 'cat',
            nickname: 'foo',
            imageUrl: 'https://placekitten.com/640/640'
        });
        expect(createFooResponse.status).toBe(201);

        const createBarResponse = await request(app).post('/api/pets').send({
            species: 'dog',
            nickname: 'bar',
            imageUrl: 'https://placedog.net/640/640'
        });
        expect(createBarResponse.status).toBe(201);

        const createBazResponse = await request(app).post('/api/pets').send({
            species: 'cat',
            nickname: 'baz',
            imageUrl: 'https://placekitten.com/540/540'
        });
        expect(createBazResponse.status).toBe(201);

        const createHamResponse = await request(app).post('/api/pets').send({
            species: 'dog',
            nickname: 'ham',
            imageUrl: 'https://placedog.net/540/540'
        });
        expect(createHamResponse.status).toBe(201);
    });

    it('should retrieve a list with 4 pets', async () => {
        const response = await request(app).get('/api/pets');
        const { status } = response;
        const pets = response.body;

        expect(status).toBe(200);
        expect(pets).toHaveLength(4);

        expect(pets).toContainEqual({
            id: 1,
            species: 'cat',
            nickname: 'foo',
            imageUrl: 'https://placekitten.com/640/640'
        });
        expect(pets).toContainEqual({
            id: 2,
            species: 'dog',
            nickname: 'bar',
            imageUrl: 'https://placedog.net/640/640'
        });
        expect(pets).toContainEqual({
            id: 3,
            species: 'cat',
            nickname: 'baz',
            imageUrl: 'https://placekitten.com/540/540'
        });
        expect(pets).toContainEqual({
            id: 4,
            species: 'dog',
            nickname: 'ham',
            imageUrl: 'https://placedog.net/540/540'
        });
    });

    it('should retrieve a list with two pets "baz" and "ham" through pagination and field selection', async () => {
        const response = await request(app).get(
            '/api/pets?page=2&pageSize=2&field=id&field=nickname'
        );
        const users = response.body;

        expect(response.status).toBe(200);
        expect(users).toHaveLength(2);

        expect(users).toContainEqual({ id: 3, nickname: 'baz' });
        expect(users).toContainEqual({ id: 4, nickname: 'ham' });
    });

    it('should retrieve a list of ids through field selection', async () => {
        const response = await request(app).get('/api/pets?field=id');
        const pets = response.body;

        expect(response.status).toBe(200);
        expect(pets).toHaveLength(4);

        const sortedIDs = pets.map((pet: { id: number }) => pet.id).sort();
        expect(sortedIDs).toEqual([1, 2, 3, 4]);
    });

    it('should retrieve an empty result for out of range pagination', async () => {
        const response = await request(app).get('/api/pets?page=10');
        const pets = response.body;

        expect(response.status).toBe(200);
        expect(pets).toHaveLength(0);
    });

    it('should retrieve the desired pet', async () => {
        const response = await request(app).get('/api/pets/1');

        expect(response.status).toBe(200);
        expect(response.body.pet).toStrictEqual({
            id: 1,
            species: 'cat',
            nickname: 'foo',
            imageUrl: 'https://placekitten.com/640/640'
        });
    });

    it("should successfully modify foo's information", async () => {
        const modifyFooResponse = await request(app).put('/api/pets/1').send({
            nickname: 'baz',
            imageUrl: 'https://placekitten.com/600/600',
            species: 'cat'
        });

        expect(modifyFooResponse.status).toBe(200);
        expect(modifyFooResponse.body.pet).toStrictEqual({
            id: 1,
            species: 'cat',
            nickname: 'baz',
            imageUrl: 'https://placekitten.com/600/600'
        });

        // "foo" is now "baz"

        const getBazResponse = await request(app).get('/api/pets/1');

        expect(getBazResponse.status).toBe(200);
        expect(getBazResponse.body.pet).toStrictEqual({
            id: 1,
            species: 'cat',
            nickname: 'baz',
            imageUrl: 'https://placekitten.com/600/600'
        });
    });

    it('should successfully delete an existing pet "baz"', async () => {
        const response = await request(app).delete('/api/pets/1');
        expect(response.status).toBe(200);
    });

    it('should not retreive information of a deleted pet "baz"', async () => {
        const response = await request(app).get('/api/pets/1');
        expect(response.status).toBe(404);
        expect(response.body.pet).toBeUndefined();
    });
});
