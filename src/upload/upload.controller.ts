import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UploadService } from './upload.service';
import { v4 as uuid } from 'uuid';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getPresignedUrl() {
    const bucketName = 'wasted-chat';
    const objectName = `${uuid()}`;
    const presignedUrl = await this.uploadService.generatePresignedUrl(bucketName, objectName);

    return { url: presignedUrl, objectName };
  }
}
