import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { role, ...data } = createUserDto as any;

    // If role is provided, look up the role by name and set roleId
    if (role) {
      const roleRecord = await this.prisma.role.findUnique({
        where: { name: role },
      });
      if (roleRecord) {
        data.roleId = roleRecord.id;
      }
    }

    return this.prisma.user.create({
      data,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        kistis: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        kistis: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { id: newId, role, password, ...data } = updateUserDto as any;

    // If password is provided, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    // If role is provided, look up the role by name and set roleId
    if (role) {
      const roleRecord = await this.prisma.role.findUnique({
        where: { name: role },
      });
      if (roleRecord) {
        data.roleId = roleRecord.id;
      }
    }

    // If new ID is provided and different from current ID, handle ID change
    if (newId && newId !== id) {
      return this.prisma.$transaction(async (tx) => {
        // Update all foreign key references in kistis table
        await tx.kisti.updateMany({
          where: { userId: id },
          data: { userId: newId },
        });

        // Update the user with new ID
        return tx.user.update({
          where: { id },
          data: {
            ...data,
            id: newId,
          },
        });
      });
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }
}
