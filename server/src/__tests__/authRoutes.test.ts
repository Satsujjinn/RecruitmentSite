import request from 'supertest';
import mongoose from 'mongoose';

jest.mock('stripe', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({ checkout: { sessions: { create: jest.fn(() => ({ url: '' })) } } }))
  };
});

let app: any;
let User: any;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  process.env.NODE_ENV = 'test';
  const mod = await import('../server');
  app = mod.app || mod.default;
  User = mod.User;

  // Mock mongoose.connect to avoid real DB connection
  jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose as any);

  // Mock user model methods with in-memory store
  const store: any[] = [];
  User.findOne = jest.fn(async (query: any) => store.find(u => u.email === query.email) || null);
  User.findByIdAndUpdate = jest.fn(async (id: string, update: any) => {
    const user = store.find(u => u._id.toString() === id.toString());
    if (user) Object.assign(user, update);
    return user;
  });
  User.prototype.save = jest.fn(async function() {
    if (this.isVerified === undefined) this.isVerified = false;
    store.push(this);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('auth routes', () => {
  it('registers and logs in a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 't@example.com', password: 'pw' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.verifyToken).toBeDefined();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 't@example.com', password: 'pw' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();
  });

  it('verifies user with token', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ver', email: 'v@example.com', password: 'pw' });

    console.log('verifyToken', reg.body.verifyToken);

    const verify = await request(app)
      .post('/api/auth/verify')
      .send({ token: reg.body.verifyToken });
    expect(verify.status).toBe(200);
    expect(verify.body.message).toBe('User verified');
  });
});
