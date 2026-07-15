import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateRoleDto {
  name!: string;
  description?: string;
  permissionIds?: number[];
}

export class UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: number[];
}

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    const { permissionIds, ...roleData } = createRoleDto;

    return this.prisma.role.create({
      data: {
        ...roleData,
        permissions: permissionIds
          ? {
              connect: permissionIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { permissionIds, ...roleData } = updateRoleDto;

    return this.prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        permissions: permissionIds
          ? {
              set: permissionIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.role.delete({
      where: { id },
    });
  }

  async addPermissions(id: number, permissionIds: number[]) {
    return this.prisma.role.update({
      where: { id },
      data: {
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  async removePermissions(id: number, permissionIds: number[]) {
    return this.prisma.role.update({
      where: { id },
      data: {
        permissions: {
          disconnect: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }
}
