const request = require('supertest');
const { User } = require('../../../models/user');
const bcrypt = require('bcrypt');

describe('/api/auth', () => {
  let server;
  let email;
  let password;
  let user;

  const exec = () => {
    return request(server)
      .post('/api/auth')
      .send({ email, password });
  };

  beforeEach(async () => {
    server = require('../../../index');
    email = 'demo@email.com';
    password = 'password';
    const salt = await bcrypt.genSalt(10);
    user = new User({
      name: '12345',
      email: email,
      password: await bcrypt.hash(password, salt),
      isAdmin: true
    });
    await user.save();
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });
  it('should return 400 if input is invalid', async () => {
    email = '1';
    password = '1';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    email = 'wrong@email.com';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if password is invalid', async () => {
    password = 'wrong';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 and token if request is valid', async () => {
    const res = await exec();

    // console.log(res);

    expect(res.text).toBe(user.generateAuthToken());
    expect(res.status).toBe(200);
  });
});
