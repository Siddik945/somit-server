import { Module } from '@nestjs/common';
import { AmountsService } from './amounts.service';
import { AmountsController } from './amounts.controller';

@Module({
  controllers: [AmountsController],
  providers: [AmountsService],
})
export class AmountsModule {}
