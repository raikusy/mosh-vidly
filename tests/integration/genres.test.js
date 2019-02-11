const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

let server;

describe('/api/genres', () => {
  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    server.close();
    await Genre.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'genre1' },
        { name: 'genre2' }
      ]);

      const res = await request(server).get('/api/genres');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a single genre', async () => {
      const genre = await Genre.collection.insertOne({ name: 'genre1' });

      const res = await request(server).get(`/api/genres/${genre.insertedId}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('genre1');
      expect(res.body._id).toBe(genre.insertedId.toHexString());
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(server).get(`/api/genres/1`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let name;

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
    });
    const exec = async () => {
      return await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre length is less then 5 char', async () => {
      name = '1234';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre length is greater then 50 char', async () => {
      name = new Array(52).join('a');
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await exec();

      const genre = await Genre.find({ name: 'genre1' });

      expect(genre).not.toBeNull();
    });

    it('should return the saved genre if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });
});
