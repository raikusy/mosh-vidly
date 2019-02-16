const request = require('supertest');
const { Customer } = require('../../../models/customer');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');

describe('/api/customers', () => {
  let server;
  let customer;
  // const exec = () => {
  //   return request(server)
  //     .get('/')
  //     .send();
  // };
  beforeEach(async () => {
    server = require('../../../index');
  });

  afterEach(async () => {
    await server.close();
    await Customer.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all customers', async () => {
      await Customer.collection.insertMany([
        { name: 'customer1', phone: '12345678', isGold: true },
        { name: 'customer2', phone: '87654321', isGold: false }
      ]);

      const res = await request(server).get('/api/customers');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === 'customer1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'customer2')).toBeTruthy();
    });
  });
  describe('GET /:id', () => {
    it('should return a single customer', async () => {
      const customer = await Customer.collection.insertOne({
        name: 'customer1',
        phone: '12345678',
        isGold: true
      });

      const res = await request(server).get(
        `/api/customers/${customer.insertedId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('customer1');
      expect(res.body._id).toBe(customer.insertedId.toHexString());
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(server).get(`/api/customers/1`);

      expect(res.status).toBe(404);
    });

    it('should return 404 no customer with id exists', async () => {
      const id = mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get(`/api/customers/${id}`);

      expect(res.status).toBe(404);
    });
  });
  describe('POST /', () => {
    // let token;
    let name;
    let phone;
    let isGold;

    beforeEach(() => {
      // token = new User().generateAuthToken();
      name = 'customer1';
      phone = '12345678';
      isGold = true;
    });
    const exec = () => {
      return (
        request(server)
          .post('/api/customers/')
          // .set('x-auth-token', token)
          .send({ name, phone, isGold })
      );
    };

    // it('should return 401 if client is not logged in', async () => {
    //   token = '';

    //   const res = await exec();

    //   expect(res.status).toBe(401);
    // });

    it('should return 400 if customer name length is less then 5 char', async () => {
      name = '1234';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if customer name length is greater then 255 char', async () => {
      name = new Array(257).join('a');
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the customer if it is valid', async () => {
      await exec();

      const customer = await Customer.find({ name: 'customer1' });

      expect(customer).not.toBeNull();
    });

    it('should return the saved customer if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', name);
      expect(res.body).toHaveProperty('phone', phone);
      expect(res.body).toHaveProperty('isGold', isGold);
    });
  });
  describe('PUT /:id', () => {
    // let token;
    let name;
    let phone;
    let isGold;
    let id;

    beforeEach(async () => {
      // token = new User().generateAuthToken();
      name = 'customer2';
      phone = '87654321';
      isGold = true;

      const customer = await Customer.collection.insertOne({
        name: 'customer1',
        phone: '12345678',
        isGold: false
      });

      id = customer.insertedId;
    });
    afterEach(async () => {
      await Customer.deleteMany({});
    });

    const exec = () => {
      return request(server)
        .put('/api/customers/' + id)
        .send({ name, phone });
    };

    // it('should return 401 if client is not logged in', async () => {
    //   token = '';

    //   const res = await exec();

    //   expect(res.status).toBe(401);
    // });

    it('should return 404 for invalid id', async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 400 if customer name length is less then 5 char', async () => {
      name = '1234';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if customer name length is greater then 255 char', async () => {
      name = new Array(257).join('a');
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if customer phone length is less then 8 char', async () => {
      phone = '1234567';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if customer phone length is greater then 15 char', async () => {
      phone = new Array(17).join('a');
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if no customer exist with the id', async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should save the customer if it is valid', async () => {
      await exec();

      const customer = await Customer.find({ name: 'customer2' });

      expect(customer).not.toBeNull();
    });

    it('should return the saved customer if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'customer2');
      expect(res.body).toHaveProperty('phone', '87654321');
    });
  });
  describe('DELETE /:id', () => {
    let token;
    let id;

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      const customer = await Customer.collection.insertOne({
        name: 'customer1',
        phone: '12345678'
      });
      id = customer.insertedId;
    });
    afterEach(async () => {
      await Customer.deleteMany({});
    });

    const exec = () => {
      return request(server)
        .delete('/api/customers/' + id)
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

    it('should return 404 if no customer exist with the id', async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the customer if id is valid', async () => {
      await exec();

      const customerInDb = await Customer.findById(id);

      expect(customerInDb).toBeNull();
    });

    it('should return the deleted customer if id is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'customer1');
      expect(res.body).toHaveProperty('phone', '12345678');
    });
  });
});
