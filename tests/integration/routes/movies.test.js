const request = require('supertest');
const mongoose = require('mongoose');
const { Movie } = require('../../../models/movie');
const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');

describe('/api/movies', () => {
  let server;
  beforeEach(() => {
    server = require('../../../index');
  });
  afterEach(async () => {
    await server.close();
    await Movie.deleteMany({});
    await Genre.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all movies', async () => {
      await Movie.collection.insertMany([
        {
          title: 'movie1',
          numberInStock: 10,
          dailyRentalRate: 2,
          genre: { name: 'genre1' }
        },
        {
          title: 'movie2',
          numberInStock: 10,
          dailyRentalRate: 5,
          genre: { name: 'genre1' }
        }
      ]);

      const res = await request(server).get('/api/movies');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.title === 'movie1')).toBeTruthy();
      expect(res.body.some(g => g.title === 'movie2')).toBeTruthy();
    });
  });
  describe('GET /:id', () => {
    it('should return a single movie', async () => {
      const movie = await Movie.collection.insertOne({
        title: 'movie1',
        numberInStock: 10,
        dailyRentalRate: 2,
        genre: { name: 'genre1' }
      });

      const res = await request(server).get(`/api/movies/${movie.insertedId}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('movie1');
      expect(res.body.numberInStock).toBe(10);
      expect(res.body.dailyRentalRate).toBe(2);
      expect(res.body._id).toBe(movie.insertedId.toHexString());
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(server).get(`/api/movies/1`);

      expect(res.status).toBe(404);
    });

    it('should return 404 no movie with id exists', async () => {
      const id = mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get(`/api/movies/${id}`);

      expect(res.status).toBe(404);
    });
  });
  describe('POST /', () => {
    let token;
    let title;
    let numberInStock;
    let dailyRentalRate;
    let genre;
    let genreId;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      title = 'movie1';
      numberInStock = 10;
      dailyRentalRate = 2;
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      genreId = genre._id;
    });
    afterEach(() => {
      Genre.deleteMany({});
      Movie.deleteMany({});
    });
    const exec = () => {
      return request(server)
        .post('/api/movies/')
        .set('x-auth-token', token)
        .send({ title, numberInStock, dailyRentalRate, genreId });
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if movie title is less then 5 char', async () => {
      title = '1234';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie title is greater then 255 char', async () => {
      title = new Array(257).join('a');
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie numberInStock is less then 0', async () => {
      numberInStock = -1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie numberInStock is greater then 255', async () => {
      numberInStock = 256;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie dailyRentalRate is less then 0', async () => {
      dailyRentalRate = -1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie dailyRentalRate is greater then 255', async () => {
      dailyRentalRate = 256;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie genreId is invalid', async () => {
      genreId = 1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if no genre found with genreId', async () => {
      genreId = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the movie if it is valid', async () => {
      await exec();

      const movie = await Movie.find({ name: 'movie1' });

      expect(movie).not.toBeNull();
    });

    it('should return the saved movie if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'movie1');
    });
  });
  describe('PUT /:id', () => {
    let token;
    let title;
    let movie;
    let id;
    let genreId;
    let numberInStock;
    let dailyRentalRate;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      const genre = await Genre.collection.insertOne({ name: 'genre2' });
      genreId = genre.insertedId;
      title = 'movie2';
      numberInStock = 20;
      dailyRentalRate = 4;
      movie = await Movie.collection.insertOne({
        title: 'movie1',
        numberInStock: 10,
        dailyRentalRate: 2,
        genre: { name: 'genre1' }
      });
      id = movie.insertedId;
    });
    afterEach(async () => {
      await Genre.deleteMany({});
    });

    const exec = () => {
      return request(server)
        .put('/api/movies/' + id)
        .set('x-auth-token', token)
        .send({ title, numberInStock, dailyRentalRate, genreId });
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

    it('should return 404 if no movie with given ID found', async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 400 if movie title is less then 5 char', async () => {
      title = '1234';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie title is greater then 255 char', async () => {
      title = new Array(257).join('a');
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie numberInStock is less then 0', async () => {
      numberInStock = -1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie numberInStock is greater then 255', async () => {
      numberInStock = 256;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie dailyRentalRate is less then 0', async () => {
      dailyRentalRate = -1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie dailyRentalRate is greater then 255', async () => {
      dailyRentalRate = 256;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie genreId is invalid', async () => {
      genreId = 1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if no genre found with genreId', async () => {
      genreId = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the movie if it is valid', async () => {
      await exec();

      const movie = await Movie.find({ title: 'movie2' });

      expect(movie).not.toBeNull();
    });

    it('should return the saved movie if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'movie2');
    });
  });
  describe('DELETE /:id', () => {
    let token;
    let id;
    let movie;

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      movie = await Movie.collection.insertOne({
        title: 'movie1',
        numberInStock: 10,
        dailyRentalRate: 2,
        genre: { name: 'genre1' }
      });
      id = movie.insertedId;
    });
    afterEach(async () => {
      await Movie.deleteMany({});
    });

    const exec = () => {
      return request(server)
        .delete('/api/movies/' + id)
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

    it('should return 404 if no movie exist with the id', async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the movie if id is valid', async () => {
      await exec();

      const movieInDb = await Movie.findById(id);

      expect(movieInDb).toBeNull();
    });

    it('should return the deleted movie if id is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'movie1');
    });
  });
});
