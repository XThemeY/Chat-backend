import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { AppGateway } from './app/app.gateway';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtJWTGuard } from './auth/common/guards';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }), AuthModule, MessageModule, UserModule],
  controllers: [],
  providers: [AppGateway, { provide: APP_GUARD, useClass: AtJWTGuard }]
})
export class AppModule {}
