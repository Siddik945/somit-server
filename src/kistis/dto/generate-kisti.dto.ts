import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GenerateKistiDto {
  @ApiProperty({
    example: '2026-06-16',
    description: 'Selected installment date',
  })
  @IsNotEmpty()
  @IsDateString()
  date!: string;
}