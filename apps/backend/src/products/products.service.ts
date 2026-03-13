import { Injectable } from '@nestjs/common';
import { CreateProductRequest, Product } from '@workspace/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProduct(createProductRequest: CreateProductRequest) {
    await this.prismaService.product.create({ data: createProductRequest });
    return createProductRequest;
  }

  async getProducts(): Promise<Product[]> {
    return this.prismaService.product.findMany();
  }
}
