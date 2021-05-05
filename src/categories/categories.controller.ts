import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './schemas/category.schema';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    const category = await this.categoriesService.findOne(id);
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Category> {
    const category = await this.categoriesService.remove(id);
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }
}
