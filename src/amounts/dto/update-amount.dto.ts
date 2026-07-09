import { PartialType } from '@nestjs/swagger';
import { CreateAmountDto } from './create-amount.dto';

export class UpdateAmountDto extends PartialType(CreateAmountDto) {}
