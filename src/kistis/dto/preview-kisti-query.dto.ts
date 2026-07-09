import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class PreviewKistiQueryDto {
  @ApiProperty({
    example: '2026-06-16',
    description: 'Selected installment date',
  })
  @IsDateString()
  date!: string;
}