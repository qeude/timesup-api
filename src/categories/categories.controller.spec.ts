import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesFixtures } from './categories.fixtures';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/MongooseTestModule';

import { Model } from 'mongoose';
import {
  Category,
  CategoryDocument,
  CategorySchema,
} from './schemas/category.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;
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
      controllers: [CategoriesController],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    controller = module.get<CategoriesController>(CategoriesController);
    categoryModel = module.get<Model<CategoryDocument>>('CategoryModel');
    categoriesFixtures = new CategoriesFixtures(service);
  });

  afterEach(async () => {
    await categoryModel.deleteMany({});
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should retrun an array of categories', async () => {
      const category = await categoriesFixtures.anyCategory();

      const categories = await controller.findAll();

      expect(categories).toHaveLength(1);
      expect(categories).toContainEqual(
        expect.objectContaining({
          _id: category._id,
          name: category.name,
        }),
      );
    });
    it('should return an empty array of categories', async () => {
      const categories = await controller.findAll();

      expect(categories).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it("should throw an error when the category doesn't exist", async () => {
      await expect(controller.findOne('test')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a valid category', async () => {
      const category = await categoriesFixtures.anyCategory();

      const result = await controller.findOne(category._id);

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
    it("should throw an error when the category doesn't exist", async () => {
      await expect(
        controller.update('test', { name: 'new name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return a valid updated category', async () => {
      const category = await categoriesFixtures.anyCategory();

      const newName = 'new name';
      const updatedCategory = await controller.update(category._id, {
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
      const category = await controller.create({ name: name });

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

      await controller.remove(category._id);

      const categories = await service.findAll();

      expect(categories).toHaveLength(0);
    });
  });
});
