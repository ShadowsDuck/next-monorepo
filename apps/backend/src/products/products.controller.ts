import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProductRequest, Product } from '@workspace/types';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() createProductRequest: CreateProductRequest) {
    return this.productsService.createProduct(createProductRequest);
  }

  @Get()
  async getProducts(): Promise<Product[]> {
    return this.productsService.getProducts();
  }
}
