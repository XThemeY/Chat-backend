import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UploadService } from './upload.service';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService
  ) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getPresignedUrl() {
    const bucketName = this.configService.get('MINIO_BUCKET_NAME') ?? 'xthemey-chat';
    const objectName = `${uuid()}`;
    const presignedUrl = await this.uploadService.generatePresignedUrl(bucketName, objectName);

    return { url: presignedUrl, objectName };
  }
}
