const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;
describe('/api/genres', () => {
  beforeEach(() => {
    server = require('../../index');
    jest.setTimeout(999999);
    server.maxConnections = 9999;
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

    it('should return 404 no genre with id exists', async () => {
      const id = mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get(`/api/genres/${id}`);

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
    const exec = () => {
      return request(server)
        .post('/api/genres/')
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

  describe('PUT /:id', () => {
    let token;
    let name;
    let id;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      const genre = await Genre.collection.insertOne({ name: 'genre1' });
      id = genre.insertedId;
      name = 'genre2';
    });
    afterEach(async () => {
      await Genre.deleteMany({});
    });

    const exec = () => {
      return request(server)
        .put('/api/genres/' + id)
        .set('x-auth-token', token)
        .send({ name });
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 404 for invalid id', async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(404);
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

    it('should return 404 if no genre exist with the id', async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should save the genre if it is valid', async () => {
      await exec();

      const genre = await Genre.find({ name: 'genre2' });

      expect(genre).not.toBeNull();
    });

    it('should return the saved genre if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre2');
    });
  });
  describe('DELETE /:id', () => {
    let token;
    let id;

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      const genre = await Genre.collection.insertOne({ name: 'genre1' });
      id = genre.insertedId;
    });
    afterEach(async () => {
      await Genre.deleteMany({});
    });

    const exec = () => {
      return request(server)
        .delete('/api/genres/' + id)
        .set('x-auth-token', token)
        .send();
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 for invalid id', async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre exist with the id', async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the genre if id is valid', async () => {
      await exec();

      const genreInDb = await Genre.findById(id);

      expect(genreInDb).toBeNull();
    });

    it('should return the deleted genre if id is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });
});
