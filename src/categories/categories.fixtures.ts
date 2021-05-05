import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';

export class CategoriesFixtures {
  service: CategoriesService;

  constructor(service: CategoriesService) {
    this.service = service;
  }

  async anyCategory(name = 'category'): Promise<Category> {
    const data = {
      name: name,
    };
    return await this.service.create(data);
  }
}
