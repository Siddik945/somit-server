import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { KistisService } from "./kistis.service";
import { GenerateKistiDto } from "./dto/generate-kisti.dto";
import { PreviewKistiQueryDto } from "./dto/preview-kisti-query.dto";
import { UpdateDepositDto } from "./dto/update-deposit.dto";
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags("Kistis")
@Controller("kistis")
@UseGuards(JwtAuthGuard, RolesGuard)
export class KistisController {
  constructor(private readonly kistisService: KistisService) {}

  /**
   * Called when the user selects a date.
   *
   * Example:
   * GET /kistis/preview?date=2026-06-16
   */
  @Get("preview")
  @Roles('ADMIN', 'MODERATOR')
  @ApiOperation({
    summary: "Preview all users and calculated Kisti information",
    description:
      "Returns every user with previous due, fine, installment, total, deposit and current due. It does not save the records.",
  })
  @ApiQuery({
    name: "date",
    example: "2026-06-16",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Calculated records returned successfully",
  })
  @ApiNotFoundResponse({
    description: "No Amount record exists for the selected month",
  })
  preview(@Query() query: PreviewKistiQueryDto) {
    return this.kistisService.preview(query.date);
  }

  /**
   * Saves Kisti records for all users.
   */
  @Post("generate")
  @Roles('ADMIN')
  @ApiOperation({
    summary: "Generate and save Kisti records for all users",
  })
  @ApiResponse({
    status: 201,
    description: "Monthly Kisti records generated successfully",
  })
  @ApiConflictResponse({
    description: "Kisti records already exist for this month",
  })
  @ApiBadRequestResponse({
    description: "No users found or invalid date",
  })
  generate(@Body() generateKistiDto: GenerateKistiDto) {
    return this.kistisService.generate(generateKistiDto);
  }

  @Get()
  @Roles('ADMIN', 'MODERATOR', 'MEMBER')
  @ApiOperation({
    summary: "Get all Kisti records by month range",
  })
  @ApiQuery({
    name: "startMonth",
    required: false,
    type: String,
    example: "2026-01",
    description: "Starting month in YYYY-MM format",
  })
  @ApiQuery({
    name: "endMonth",
    required: false,
    type: String,
    example: "2026-06",
    description: "Ending month in YYYY-MM format",
  })
  findAll(
    @Query("startMonth") startMonth?: string,
    @Query("endMonth") endMonth?: string,
  ) {
    return this.kistisService.findAll(startMonth, endMonth);
  }

  /**
   * This route must appear before @Get(':id').
   */
  @Get("by-date")
  @Roles('ADMIN', 'MODERATOR', 'MEMBER')
  @ApiOperation({
    summary: "Get saved Kisti records for a selected month",
  })
  @ApiQuery({
    name: "date",
    example: "2026-06-16",
    required: true,
  })
  findByDate(@Query() query: PreviewKistiQueryDto) {
    return this.kistisService.findByDate(query.date);
  }

  @Get(":id")
  @Roles('ADMIN', 'MODERATOR', 'MEMBER')
  @ApiOperation({
    summary: "Get one Kisti record",
  })
  @ApiParam({
    name: "id",
    example: 1,
  })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.kistisService.findOne(id);
  }

  @Patch(":id/deposit")
  @Roles('ADMIN', 'MODERATOR')
  @ApiOperation({
    summary: "Update deposit and automatically recalculate current due",
  })
  @ApiParam({
    name: "id",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Deposit and current due updated successfully",
  })
  updateDeposit(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDepositDto: UpdateDepositDto,
  ) {
    return this.kistisService.updateDeposit(id, updateDepositDto);
  }

  /**
   * Delete every Kisti record of a selected month.
   *
   * Example:
   * DELETE /kistis/by-month?month=2026-06
   */
  @Delete("by-month")
  @Roles('ADMIN')
  @ApiOperation({
    summary: "Delete all Kisti records of a selected month",
  })
  @ApiQuery({
    name: "month",
    example: "2026-06",
    description: "Month must be provided in YYYY-MM format",
  })
  @ApiResponse({
    status: 200,
    description: "Monthly Kisti records deleted successfully",
  })
  @ApiBadRequestResponse({
    description: "Invalid month format",
  })
  removeByMonth(@Query("month") month: string) {
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new BadRequestException(
        "Month must be provided in YYYY-MM format.",
      );
    }

    return this.kistisService.removeByMonth(month);
  }
}
