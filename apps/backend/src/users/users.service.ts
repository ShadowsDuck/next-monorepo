import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserRequest } from '@workspace/types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async create(createUserRequest: CreateUserRequest) {
    const user = await this.prisma.user.create({
      data: createUserRequest,
    });

    return user;
  }
}
