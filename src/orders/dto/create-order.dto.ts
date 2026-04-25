import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  product!: string;

  @ApiProperty()
  price!: number;
}
