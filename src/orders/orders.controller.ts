import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller()
export class OrdersController {
  constructor(private orderService: OrdersService) {}

  @Post('order')
  create(@Body() body: CreateOrderDto) {
    return this.orderService.create(body);
  }

  @Get('orders')
  findAll() {
    return this.orderService.findAll();
  }
}
