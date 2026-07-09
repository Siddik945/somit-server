import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAmountDto {
  @ApiProperty({
    example: 1000,
  })
  amount!: number;

  @ApiPropertyOptional({
    example: 'active',
  })
  status?: string;

  @ApiPropertyOptional({
    example: '2026-06-16T00:00:00.000Z',
  })
  date?: Date;
}