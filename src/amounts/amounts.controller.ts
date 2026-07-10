import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AmountsService } from './amounts.service';
import { CreateAmountDto } from './dto/create-amount.dto';
import { UpdateAmountDto } from './dto/update-amount.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Amounts')
@Controller('amounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AmountsController {
  constructor(private readonly amountsService: AmountsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create Amount' })
  create(@Body() createAmountDto: CreateAmountDto) {
    return this.amountsService.create(createAmountDto);
  }

  @Get()
  @Roles('ADMIN', 'MODERATOR', 'MEMBER')
  @ApiOperation({ summary: 'Get All Amounts' })
  findAll() {
    return this.amountsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'MODERATOR', 'MEMBER')
  @ApiOperation({ summary: 'Get Amount By Id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.amountsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update Amount' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAmountDto: UpdateAmountDto,
  ) {
    return this.amountsService.update(id, updateAmountDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete Amount' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.amountsService.remove(id);
  }
}