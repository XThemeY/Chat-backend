import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtJWTGuard } from './auth/common/guards';
import { ConversationModule } from './conversation/conversation.module';
import { UploadModule } from './upload/upload.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.production', '.env', '.minio_keys.env'] }),
    SocketModule,
    AuthModule,
    MessageModule,
    UserModule,
    ConversationModule,
    UploadModule
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AtJWTGuard }]
})
export class AppModule {}
