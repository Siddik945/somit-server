import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreatePermissionDto {
  name!: string;
  description?: string;
  resource!: string;
  action!: string;
}

export class UpdatePermissionDto {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
}

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      include: {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: createPermissionDto,
    });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: number) {
    return this.prisma.permission.delete({
      where: { id },
    });
  }
}
