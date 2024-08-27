import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AtJWTStrategy } from './strategies';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtJWTStrategy],
  exports: [AuthService]
})
export class AuthModule {}
