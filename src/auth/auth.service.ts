import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleName = user.role?.name || 'MEMBER';
    const payload = { email: user.email, sub: user.id, role: roleName };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
      },
    };
  }

  async register(name: string, email: string, password: string, role?: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Find or create the role
    let roleId;
    if (role) {
      const roleRecord = await this.prisma.role.findUnique({
        where: { name: role },
      });
      if (roleRecord) {
        roleId = roleRecord.id;
      }
    }
    
    // Default to MEMBER role if no role specified or role not found
    if (!roleId) {
      const defaultRole = await this.prisma.role.findFirst({
        where: { name: 'MEMBER' },
      });
      roleId = defaultRole?.id;
    }
    
    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      roleId,
    });

    // Fetch user with role relation
    const userWithRole = await this.usersService.findByEmail(email);
    if (!userWithRole) {
      throw new UnauthorizedException('Failed to create user');
    }
    
    const roleName = userWithRole.role?.name || 'MEMBER';
    const payload = { email: userWithRole.email, sub: userWithRole.id, role: roleName };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userWithRole.id,
        name: userWithRole.name,
        email: userWithRole.email,
        role: roleName,
      },
    };
  }
}
