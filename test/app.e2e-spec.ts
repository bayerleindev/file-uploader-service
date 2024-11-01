import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { UploadAgentPool } from '../src/upload/upload.agent.pool';

describe('UploadController (e2e)', () => {
  let app: INestApplication;
  let testFilePath: string;
  let uploadAgentPool: UploadAgentPool;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testFilePath = path.join(__dirname, 'testFile.csv');
    fs.writeFileSync(testFilePath, 'This is a test file.');
    uploadAgentPool = app.get<UploadAgentPool>(UploadAgentPool);

    await request(app.getHttpServer())
      .post('/users')
      .send({
        username: 'e2e-executor',
        password: 'e2e-executor',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();

    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it('should upload a file successfully', async () => {
    const buffer = Buffer.from('some data');
    const response = await request(app.getHttpServer())
      .post('/upload')
      .attach('file', buffer, `${__dirname}/testFile.csv`)
      .set(
        'Authorization',
        'Basic ' + Buffer.from('e2e-executor:e2e-executor').toString('base64'),
      )
      .expect(201);

    expect(response.body).toHaveProperty(
      'message',
      'File uploaded successfully',
    );
  });

  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app.getHttpServer())
      .post('/upload')
      .set(
        'Authorization',
        'Basic ' + Buffer.from('e2e-executor:e2e-executor').toString('base64'),
      )
      .expect(400);

    expect(response.body).toHaveProperty('message', 'File is required');
  });

  it('should return 400 if username is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/upload')
      .set(
        'Authorization',
        'Basic ' + Buffer.from('test:test').toString('base64'),
      )
      .attach('file', testFilePath)
      .expect(401);

    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 429 if no agents are available', async () => {
    jest.spyOn(uploadAgentPool, 'allocateAgent').mockResolvedValue(false);
    const response = await request(app.getHttpServer())
      .post('/upload')
      .attach('file', `${__dirname}/testFile.csv`)
      .set(
        'Authorization',
        'Basic ' + Buffer.from('e2e-executor:e2e-executor').toString('base64'),
      )
      .expect(429);

    expect(response.body).toHaveProperty(
      'message',
      'ThrottlerException: Too Many Requests',
    );
  });
});
