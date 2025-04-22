import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private s3: S3;
  private bucketName: string; 


  //Constructor sets up instance with SDK values for bucket accessKeyId and etc. 
  // and below are defined three methods on how to upload download and delete files from it.
  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
    this.s3 = new S3({
      endpoint: this.configService.getOrThrow<string>('S3_ENDPOINT'),
      s3ForcePathStyle: true,
      accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_KEY'),
    });
  }


  //uploadfile
  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return key;
  }
//downloadfle
  getFileStream(key: string): Readable {
    return this.s3
      .getObject({
        Bucket: this.bucketName,
        Key: key,
      })
      .createReadStream();
  }
//deletefile
  async deleteFile(key: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: key,
      })
      .promise();
  }
}
