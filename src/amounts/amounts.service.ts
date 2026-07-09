import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmountDto } from './dto/create-amount.dto';
import { UpdateAmountDto } from './dto/update-amount.dto';

@Injectable()
export class AmountsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAmountDto: CreateAmountDto) {
    return this.prisma.amount.create({
      data: {
        ...createAmountDto,
        date: createAmountDto.date
          ? new Date(createAmountDto.date)
          : new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.amount.findMany({
      include: {
        kistis: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.amount.findUnique({
      where: { id },
      include: {
        kistis: true,
      },
    });
  }

  update(id: number, updateAmountDto: UpdateAmountDto) {
    return this.prisma.amount.update({
      where: { id },
      data: updateAmountDto,
    });
  }

  remove(id: number) {
    return this.prisma.amount.delete({
      where: { id },
    });
  }
}