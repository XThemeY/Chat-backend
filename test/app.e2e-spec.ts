import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getPassword, getString } from './helpers/mocks';
import { CreateAuthDto } from 'src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  it('/register (POST)', () => {
    const registerDto: CreateAuthDto = {
      login: getString(),
      password: getPassword(8),
      name: getString()
    };
    expect(prisma).toBeDefined();
    request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201)
      .then((res) => {
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.body.accessToken as string).toBeDefined();
        expect(res.status).toBe(201);
      });
  });
});
