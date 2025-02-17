import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { configService } from '../../src/config/config.service';
import { GlobalModule } from '../../src/global.module';
import { ServiceCenterModule } from '../../src/service-center/service-center.module';
import { ReviewModule } from './../../src/review/review.module';
import { UserModule } from './../../src/user/user.module';

describe('Component test backend', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        ServiceCenterModule,
        ReviewModule,
        UserModule,
        GlobalModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.setTimeout(10000);
  });

  afterAll(async () => {
    await app.close();
  });

  //Test Api GetServiceCenterByLocation using latitude longitude
  describe('GetServiceCenterByLocation', () => {
    it('should return correct service center', async () => {
      const { body: services } = await supertest(app.getHttpServer())
        .get(`/service_center/location`)
        .query({
          lat: 13.7749,
          lon: 100.5197,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      services.forEach((e) => {
        expect(typeof e).toBe('object');
        expect(e.distance).toBeLessThan(30 * 1000);
      });
      expect(services.length).toBeGreaterThan(0);
    });
  });

  //Test Api GetServiceCenterById using ServiceCenterId
  describe('GetServiceCenterById', () => {
    it('should return correct service center', async () => {
      const id = '31a26fa9-55db-4059-b4a3-4c59de3f9b5b';
      const { body: service } = await supertest(app.getHttpServer())
        .get(`/service_center/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(typeof service).toBe('object');
      expect(service.id).toBe(id);
    });
  });

  //Test Api GetReviewByServiceCenterId using ServiceCenterId
  describe('GetReviewByServiceCenter', () => {
    it('should return correct service center', async () => {
      const serviceId = '31a26fa9-55db-4059-b4a3-4c59de3f9b5b';
      const { body: reviews } = await supertest(app.getHttpServer())
        .get(`/review/${serviceId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      reviews.forEach((e) => {
        expect(typeof e).toBe('object');
      });
      expect(reviews.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GetAllServiceCenter', () => {
    it('should return All correct service center', async () => {
      const { body: services } = await supertest(app.getHttpServer())
        .get(`/service_center/search`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      services.forEach((e) => {
        expect(typeof e).toBe('object');
      });
      expect(services.length).toBeGreaterThan(0);
    });
  });

  describe('GetServiceCenterBySearch', () => {
    it('should return correct service center', async () => {
      const search = 'กรุงเทพมหานคร';
      const { body: services } = await supertest(app.getHttpServer())
        .get(`/service_center/search`)
        .query({
          search: 'กรุงเทพมหานคร',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      services.forEach((e) => {
        expect(typeof e).toBe('object');
        expect(e.province).toEqual(search);
      });
      expect(services.length).toBeGreaterThan(0);
    });
  });
});
