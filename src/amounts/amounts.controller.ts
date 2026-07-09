import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AmountsService } from './amounts.service';
import { CreateAmountDto } from './dto/create-amount.dto';
import { UpdateAmountDto } from './dto/update-amount.dto';

@ApiTags('Amounts')
@Controller('amounts')
export class AmountsController {
  constructor(private readonly amountsService: AmountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create Amount' })
  create(@Body() createAmountDto: CreateAmountDto) {
    return this.amountsService.create(createAmountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Amounts' })
  findAll() {
    return this.amountsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Amount By Id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.amountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Amount' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAmountDto: UpdateAmountDto,
  ) {
    return this.amountsService.update(id, updateAmountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Amount' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.amountsService.remove(id);
  }
}