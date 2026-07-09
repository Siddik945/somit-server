import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AmountsModule } from './amounts/amounts.module';
import { KistisModule } from './kistis/kistis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AmountsModule,
    KistisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
