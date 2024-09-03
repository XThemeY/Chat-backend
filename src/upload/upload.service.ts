import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class UploadService {
  private readonly minioClient: Client;

  constructor(private configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get('MINIO_SERVER_ENDPOINT'),
      port: Number(this.configService.get('MINIO_SERVER_PORT')),
      useSSL: this.configService.get('MINIO_SERVER_SSL') === 'true',
      accessKey: this.configService.get('MINIO_SERVER_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SERVER_SECRET_KEY')
    });
  }

  async generatePresignedUrl(bucketName: string, objectName: string): Promise<string> {
    return this.minioClient.presignedPutObject(bucketName, objectName, 24 * 60);
  }
}
