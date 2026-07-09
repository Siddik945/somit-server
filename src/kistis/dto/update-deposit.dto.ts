import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min } from 'class-validator';

export class UpdateDepositDto {
  @ApiProperty({
    example: 800,
    minimum: 0,
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  joma!: number;
}