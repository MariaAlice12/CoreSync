import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';

export interface StoredFile {
  key: string;
  url: string;
}

export const LOCAL_UPLOAD_DIR =
  process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

// Armazena arquivos no Amazon S3 quando AWS_S3_BUCKET está configurado;
// caso contrário grava em ./uploads (servido em /uploads pelo ServeStaticModule).
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = process.env.AWS_S3_BUCKET;
  private readonly region = process.env.AWS_REGION || 'us-east-1';
  private readonly publicBaseUrl = process.env.AWS_S3_PUBLIC_URL;
  private readonly apiBaseUrl =
    process.env.API_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 8080}`;
  private readonly s3 = this.bucket
    ? new S3Client({ region: this.region })
    : null;

  get driver(): 's3' | 'local' {
    return this.s3 ? 's3' : 'local';
  }

  async upload(file: Express.Multer.File, folder: string): Promise<StoredFile> {
    const key = `${folder}/${randomUUID()}${extname(file.originalname).toLowerCase()}`;

    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      const base =
        this.publicBaseUrl ??
        `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
      return { key, url: `${base}/${key}` };
    }

    const path = join(LOCAL_UPLOAD_DIR, key);
    await mkdir(join(LOCAL_UPLOAD_DIR, folder), { recursive: true });
    await writeFile(path, file.buffer);
    return { key, url: `${this.apiBaseUrl}/uploads/${key}` };
  }

  async remove(key: string) {
    try {
      if (this.s3) {
        await this.s3.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
        );
      } else {
        await unlink(join(LOCAL_UPLOAD_DIR, key));
      }
    } catch (err) {
      // O registro no banco é removido mesmo se o arquivo já não existir.
      this.logger.warn(`Falha ao remover arquivo ${key}: ${String(err)}`);
    }
  }
}
