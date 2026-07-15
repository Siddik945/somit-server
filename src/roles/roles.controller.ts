import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

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

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  @Post(':id/permissions')
  async addPermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: number[]) {
    return this.rolesService.addPermissions(+id, permissionIds);
  }

  @Delete(':id/permissions')
  async removePermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: number[]) {
    return this.rolesService.removePermissions(+id, permissionIds);
  }
}
