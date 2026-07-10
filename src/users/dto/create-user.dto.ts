import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
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