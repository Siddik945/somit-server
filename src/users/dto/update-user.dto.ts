import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 1,
  })
  id?: number;

  @ApiPropertyOptional({
    example: 'Rahim',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'member',
  })
  role?: string;

  @ApiPropertyOptional({
    example: 'rahim@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'password123',
  })
  password?: string;
}