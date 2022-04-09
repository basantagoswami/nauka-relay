import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './modules/events/events.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [EventsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
