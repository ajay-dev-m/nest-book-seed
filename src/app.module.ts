import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './modules/modules.module';
import { PrismaModule } from './utils/prisma/prisma.module';

@Module({
  imports: [PrismaModule, BaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
