import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

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

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
