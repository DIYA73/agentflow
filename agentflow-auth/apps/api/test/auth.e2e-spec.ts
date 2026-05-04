import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  // ─── Register ───────────────────────────────────────────

  it('POST /auth/register — creates workspace + user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Diya',
        email: 'diya@test.com',
        password: 'TestPass123!',
        workspaceName: 'test-workspace',
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.workspaceName).toBe('test-workspace');
    expect(res.body.user.role).toBe('owner');

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('POST /auth/register — rejects duplicate email', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Other',
        email: 'diya@test.com',
        password: 'TestPass123!',
        workspaceName: 'other-workspace',
      })
      .expect(409);
  });

  // ─── Login ──────────────────────────────────────────────

  it('POST /auth/login — returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'diya@test.com', password: 'TestPass123!' })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
  });

  it('POST /auth/login — rejects wrong password', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'diya@test.com', password: 'wrongpass' })
      .expect(401);
  });

  // ─── Protected Routes ────────────────────────────────────

  it('GET /workspace — returns workspace when authenticated', () => {
    return request(app.getHttpServer())
      .get('/workspace')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /workspace — 401 without token', () => {
    return request(app.getHttpServer())
      .get('/workspace')
      .expect(401);
  });

  // ─── Refresh ────────────────────────────────────────────

  it('POST /auth/refresh — returns new access token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
  });

  // ─── Logout ─────────────────────────────────────────────

  it('POST /auth/logout — invalidates refresh token', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
