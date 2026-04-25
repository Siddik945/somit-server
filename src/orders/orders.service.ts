import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateOrderDto) {
    return this.prisma.order.create({ data });
  }

  findAll() {
    return this.prisma.order.findMany();
  }
}
