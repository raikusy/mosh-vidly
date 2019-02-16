const { Rental } = require('../../../models/rental');
const { User } = require('../../../models/user');
const { Movie } = require('../../../models/movie');
const mongoose = require('mongoose');
const request = require('supertest');
const moment = require('moment');

describe('/api/returns', () => {
  let server;
  let rental;
  let customerId;
  let movieId;
  let token;
  let movie;

  const exec = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    jest.setTimeout(99999);
    server = require('../../../index');
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: '12345',
      numberInStock: 10,
      dailyRentalRate: 2,
      genre: { name: '12345' }
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345678'
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2
      }
    });
    await rental.save();
  });
  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  it('should return 401 if the client is not logged in', async () => {
    token = '';
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it('should return 400 if the customerId is not provided', async () => {
    customerId = '';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 400 if the movieId is not provided', async () => {
    movieId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental found for this customer/movie', async () => {
    await Rental.deleteMany({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if rental is already processed', async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200 if request is valid', async () => {
    const res = await exec();
    // console.log(res.body);
    expect(res.status).toBe(200);
  });

  it('should set dateReturned if input is valid', async () => {
    const res = await exec();
    // console.log(res.body);
    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(res.status).toBe(200);
    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should set rentalFee if input is valid', async () => {
    rental.dateOut = moment()
      .add(-7, 'days')
      .toDate();
    await rental.save();
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);

    expect(res.status).toBe(200);
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it('should increase the movie stock', async () => {
    const prevStock = movie.numberInStock;
    const res = await exec();
    const movieInDb = await Movie.findById(movie._id);
    const newStock = movieInDb.numberInStock;

    expect(res.status).toBe(200);
    expect(newStock).toBe(prevStock + 1);
  });

  it('should return rental object if input is valid', async () => {
    const res = await exec();

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        'dateOut',
        'dateReturned',
        'rentalFee',
        'customer',
        'movie'
      ])
    );
  });
});
