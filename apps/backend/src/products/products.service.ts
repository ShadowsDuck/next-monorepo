import { Injectable } from '@nestjs/common';
import { CreateProductRequest, Product } from '@workspace/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(createProductRequest: CreateProductRequest) {
    await this.prisma.product.create({ data: createProductRequest });
    return createProductRequest;
  }

  async getProducts(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }
}
