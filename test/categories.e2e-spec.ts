import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CategoriesModule } from '../src/categories/categories.module';
import { CategoriesService } from '../src/categories/categories.service';
import { Model } from 'mongoose';
import { CategoryDocument } from '../src/categories/schemas/category.schema';
import { CategoriesFixtures } from '../src/categories/categories.fixtures';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
  toJSON,
} from '../src/test-utils/MongooseTestModule';

describe('Categories E2E testing', () => {
  let app: INestApplication;
  let service: CategoriesService;
  let categoryModel: Model<CategoryDocument>;
  let categoriesFixtures: CategoriesFixtures;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), CategoriesModule],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryModel = module.get<Model<CategoryDocument>>('CategoryModel');
    categoriesFixtures = new CategoriesFixtures(service);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await categoryModel.deleteMany({});
    await closeInMongodConnection();
    await app.close();
  });

  describe(`/GET categories`, () => {
    it('should return a 200 status and list of categories', async () => {
      await categoriesFixtures.anyCategory();

      const expectedData = await service.findAll();

      return request(app.getHttpServer())
        .get('/categories')
        .expect(200)
        .expect(toJSON(expectedData));
    });
  });

  describe(`/GET categories/:id`, () => {
    it('should return a 200 status and a category', async () => {
      const category = await categoriesFixtures.anyCategory();

      const expectedData = await service.findOne(category._id);

      return request(app.getHttpServer())
        .get(`/categories/${category._id}`)
        .expect(200)
        .expect(toJSON(expectedData));
    });
    it('should return a 404 status', async () => {
      return request(app.getHttpServer()).get(`/categories/test`).expect(404);
    });
  });

  describe(`/POST categories/`, () => {
    it('should return a 201 status and the created category', async () => {
      return request(app.getHttpServer())
        .post(`/categories`)
        .send({ name: 'test category' })
        .expect(201);
    });
  });
  describe(`/PATCH categories/:id`, () => {
    it('should return a 200 status and the updated category', async () => {
      const category = await categoriesFixtures.anyCategory();
      const newName = 'test category';

      const expectedData = await service.findOne(category._id);
      expectedData.name = newName;

      return request(app.getHttpServer())
        .patch(`/categories/${category._id}`)
        .send({ name: newName })
        .expect(200)
        .expect(toJSON(expectedData));
    });
    it('should return a 404 status', async () => {
      return request(app.getHttpServer()).patch(`/categories/test`).expect(404);
    });
  });

  describe(`/DELETE categories/:id`, () => {
    it('should return a 200 status and the deleted category', async () => {
      const category = await categoriesFixtures.anyCategory();

      const expectedData = await service.findOne(category._id);

      return request(app.getHttpServer())
        .delete(`/categories/${category._id}`)
        .expect(200)
        .expect(toJSON(expectedData));
    });
    it('should return a 404 status', async () => {
      return request(app.getHttpServer())
        .delete(`/categories/test`)
        .expect(404);
    });
  });
});
