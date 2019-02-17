const request = require('supertest');
const { Rental } = require('../../../models/rental');
const { Customer } = require('../../../models/customer');
const { Movie } = require('../../../models/movie');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');

let server;
describe('/api/rentals', () => {
  beforeEach(() => {
    server = require('../../../index');
  });
  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all rentals', async () => {
      await Rental.collection.insertMany([
        {
          customer: {
            name: 'customer1',
            phone: '12345678',
            isGold: true
          },
          movie: {
            title: 'movie1',
            dailyRentalRate: 2
          },
          dateOut: new Date()
        },
        {
          customer: {
            name: 'customer2',
            phone: '12345678',
            isGold: true
          },
          movie: {
            title: 'movie2',
            dailyRentalRate: 4
          },
          dateOut: new Date()
        }
      ]);

      const res = await request(server).get('/api/rentals');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.customer.name === 'customer1')).toBeTruthy();
      expect(res.body.some(g => g.customer.name === 'customer2')).toBeTruthy();
      expect(res.body.some(g => g.movie.title === 'movie1')).toBeTruthy();
      expect(res.body.some(g => g.movie.title === 'movie2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let rental;
    beforeEach(async () => {
      rental = await Rental.collection.insertOne({
        customer: {
          name: 'customer1',
          phone: '12345678',
          isGold: true
        },
        movie: {
          title: 'movie1',
          dailyRentalRate: 2
        },
        dateOut: new Date()
      });
    });
    afterEach(async () => {
      await Rental.deleteMany({});
    });
    it('should return a single rental', async () => {
      const res = await request(server).get(
        `/api/rentals/${rental.insertedId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.customer.name).toBe('customer1');
      expect(res.body.movie.title).toBe('movie1');
      expect(res.body._id).toBe(rental.insertedId.toHexString());
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(server).get(`/api/rentals/1`);

      expect(res.status).toBe(404);
    });

    it('should return 404 no rental with id exists', async () => {
      const id = mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get(`/api/rentals/${id}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let customer;
    let movie;
    let customerId;
    let movieId;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      customer = new Customer({
        name: 'customer1',
        phone: '12345678',
        isGold: true
      });
      await customer.save();
      customerId = customer._id;
      movie = new Movie({
        title: 'movie1',
        dailyRentalRate: 2,
        numberInStock: 10,
        genre: { name: 'genre1' }
      });
      await movie.save();
      movieId = movie._id;
    });

    afterEach(async () => {
      await Customer.deleteMany({});
      await Movie.deleteMany({});
      await Rental.deleteMany({});
    });
    const exec = () => {
      return request(server)
        .post('/api/rentals')
        .set('x-auth-token', token)
        .send({ customerId, movieId });
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      // console.log(res.text);

      expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is invalid', async () => {
      customerId = 1;
      const res = await exec();

      // console.log(res.text);

      expect(res.status).toBe(400);
    });

    it('should return 400 if no customer found with customerId', async () => {
      customerId = mongoose.Types.ObjectId();
      const res = await exec();

      // console.log(res.text);

      expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is invalid', async () => {
      movieId = 1;
      const res = await exec();

      // console.log(res.text);

      expect(res.status).toBe(400);
    });

    it('should return 400 if no movie found with movieId', async () => {
      movieId = mongoose.Types.ObjectId();
      const res = await exec();

      // console.log(res.text);

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie is out of stock', async () => {
      movie.numberInStock = 0;
      await movie.save();
      const res = await exec();

      // console.log(res.text);

      expect(res.status).toBe(400);
    });

    // TODO: Fix this test

    it('should save the rental if it is valid', async () => {
      await exec();

      const rentalInDb = await Rental.lookup(customerId, movieId);

      console.log(rentalInDb);

      expect(rentalInDb).not.toBeNull();
    });

    it('should return the saved rental if it is valid', async () => {
      const res = await exec();

      // console.log(res.body);

      expect(res.body).toHaveProperty('_id');
    });
  });

  // TODO: Complete rest of the tests

  // describe('PUT /:id', () => {
  //   let token;
  //   let customer;
  //   let movie;
  //   let customerId;
  //   let movieId;

  //   beforeEach(async () => {
  //     token = new User().generateAuthToken();

  //   });

  //   afterEach(async () => {
  //     await Customer.deleteMany({});
  //     await Movie.deleteMany({});
  //     await Rental.deleteMany({});
  //   });

  //   const exec = () => {
  //     return request(server)
  //       .put('/api/rentals/' + id)
  //       .set('x-auth-token', token)
  //       .send({ customerId, movieId });
  //   };

  //   it('should return 401 if client is not logged in', async () => {
  //     token = '';

  //     const res = await exec();

  //     expect(res.status).toBe(401);
  //   });

  //   it('should return 404 for invalid id', async () => {
  //     id = 1;
  //     const res = await exec();

  //     expect(res.status).toBe(404);
  //   });

  //   it('should return 400 if genre length is less then 5 char', async () => {
  //     name = '1234';
  //     const res = await exec();

  //     expect(res.status).toBe(400);
  //   });

  //   it('should return 400 if genre length is greater then 50 char', async () => {
  //     name = new Array(52).join('a');
  //     const res = await exec();

  //     expect(res.status).toBe(400);
  //   });

  //   it('should return 404 if no genre exist with the id', async () => {
  //     id = mongoose.Types.ObjectId().toHexString();

  //     const res = await exec();

  //     expect(res.status).toBe(404);
  //   });

  //   it('should save the genre if it is valid', async () => {
  //     await exec();

  //     const genre = await Genre.find({ name: 'genre2' });

  //     expect(genre).not.toBeNull();
  //   });

  //   it('should return the saved genre if it is valid', async () => {
  //     const res = await exec();

  //     expect(res.body).toHaveProperty('_id');
  //     expect(res.body).toHaveProperty('name', 'genre2');
  //   });
  // });

  // describe('DELETE /:id', () => {
  //   let token;
  //   let id;

  //   beforeEach(async () => {
  //     token = new User({ isAdmin: true }).generateAuthToken();
  //     const genre = await Genre.collection.insertOne({ name: 'genre1' });
  //     id = genre.insertedId;
  //   });
  //   afterEach(async () => {
  //     await Genre.deleteMany({});
  //   });

  //   const exec = () => {
  //     return request(server)
  //       .delete('/api/genres/' + id)
  //       .set('x-auth-token', token)
  //       .send();
  //   };

  //   it('should return 401 if client is not logged in', async () => {
  //     token = '';

  //     const res = await exec();

  //     expect(res.status).toBe(401);
  //   });

  //   it('should return 403 if the user is not an admin', async () => {
  //     token = new User({ isAdmin: false }).generateAuthToken();

  //     const res = await exec();

  //     expect(res.status).toBe(403);
  //   });

  //   it('should return 404 for invalid id', async () => {
  //     id = 1;
  //     const res = await exec();

  //     expect(res.status).toBe(404);
  //   });

  //   it('should return 404 if no genre exist with the id', async () => {
  //     id = mongoose.Types.ObjectId().toHexString();

  //     const res = await exec();

  //     expect(res.status).toBe(404);
  //   });

  //   it('should delete the genre if id is valid', async () => {
  //     await exec();

  //     const genreInDb = await Genre.findById(id);

  //     expect(genreInDb).toBeNull();
  //   });

  //   it('should return the deleted genre if id is valid', async () => {
  //     const res = await exec();

  //     expect(res.body).toHaveProperty('_id');
  //     expect(res.body).toHaveProperty('name', 'genre1');
  //   });
  // });
});
