import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/MongooseTestModule';
import { CategoriesFixtures } from './categories.fixtures';
import { CategoriesService } from './categories.service';
import {
  Category,
  CategoryDocument,
  CategorySchema,
} from './schemas/category.schema';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: Model<CategoryDocument>;
  let categoriesFixtures: CategoriesFixtures;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Category.name, schema: CategorySchema },
        ]),
      ],
      providers: [CategoriesService],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryModel = module.get<Model<CategoryDocument>>('CategoryModel');
    categoriesFixtures = new CategoriesFixtures(service);
  });

  afterEach(async () => {
    await categoryModel.deleteMany({});
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const category = await categoriesFixtures.anyCategory();

      const categories = await service.findAll();

      expect(categories).toHaveLength(1);
      expect(categories).toContainEqual(
        expect.objectContaining({
          _id: category._id,
          name: category.name,
        }),
      );
    });

    it('should return an empty array of categories', async () => {
      const categories = await service.findAll();

      expect(categories).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it("should return null when the category doesn't exist", async () => {
      const category = await service.findOne('test');
      expect(category).toBeNull();
    });

    it('should return a valid category', async () => {
      const category = await categoriesFixtures.anyCategory();

      const result = await service.findOne(category._id);

      expect(result).not.toBeNull();
      expect(result).toEqual(
        expect.objectContaining({
          _id: category._id,
          name: category.name,
        }),
      );
    });
  });

  describe('update', () => {
    it("should return null when the category doesn't exist", async () => {
      const category = await service.update('test', { name: 'new name' });
      expect(category).toBeNull();
    });

    it('should return a valid updated category', async () => {
      const category = await categoriesFixtures.anyCategory();

      const newName = 'new name';
      const updatedCategory = await service.update(category._id, {
        name: newName,
      });

      expect(updatedCategory).toEqual(
        expect.objectContaining({
          _id: category._id,
          name: newName,
        }),
      );
    });
  });

  describe('create', () => {
    it('should return a valid created category', async () => {
      const name = 'created category';
      const category = await service.create({ name: name });

      expect(category).toEqual(
        expect.objectContaining({
          name: name,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      const category = await categoriesFixtures.anyCategory();

      await service.remove(category._id);

      const categories = await service.findAll();

      expect(categories).toHaveLength(0);
    });
  });
});
