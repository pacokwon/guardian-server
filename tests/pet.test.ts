import request from 'supertest';
import app from '@/app';
import { getPool } from '@/common/db';

describe('/api/pets endpoint test', () => {
    afterAll(async () => {
        await getPool().end();
    });

    it('should retrieve an empty list of pets', async () => {
        const response = await request(app).get('/api/pets');
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual([]);
    });

    it('should successfully create two new pets "foo" and "bar"', async () => {
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
    });

    it('should retrieve a list with two pets "foo" and "bar"', async () => {
        const response = await request(app).get('/api/pets');
        const { status } = response;
        const pets = response.body;

        expect(status).toBe(200);
        expect(pets).toHaveLength(2);

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
