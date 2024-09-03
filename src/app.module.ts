import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { AppGateway } from './app/app.gateway';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtJWTGuard } from './auth/common/guards';
import { ConversationService } from './conversation/conversation.service';
import { ConversationModule } from './conversation/conversation.module';
import { DialogModule } from './dialog/dialog.module';
import { UploadService } from './upload/upload.service';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    MessageModule,
    UserModule,
    ConversationModule,
    DialogModule,
    UploadModule
  ],
  controllers: [],
  providers: [AppGateway, { provide: APP_GUARD, useClass: AtJWTGuard }, ConversationService, UploadService]
})
export class AppModule {}
