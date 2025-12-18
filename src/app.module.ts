import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './iam/iam.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [IamModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
