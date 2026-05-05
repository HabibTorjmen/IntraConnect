import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Readable } from 'stream';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
  ServerSideEncryption,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  forcePathStyle: boolean;
  signedUrlTtlSeconds: number;
}

function loadConfig(): StorageConfig {
  return {
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: process.env.S3_REGION ?? 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
    bucket: process.env.S3_BUCKET ?? 'intraconnect',
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
    signedUrlTtlSeconds: parseInt(process.env.S3_SIGNED_URL_TTL ?? '300', 10),
  };
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly cfg: StorageConfig = loadConfig();
  private readonly client = new S3Client({
    endpoint: this.cfg.endpoint,
    region: this.cfg.region,
    credentials: {
      accessKeyId: this.cfg.accessKeyId,
      secretAccessKey: this.cfg.secretAccessKey,
    },
    forcePathStyle: this.cfg.forcePathStyle,
  });

  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.cfg.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.cfg.bucket }));
        this.logger.log(`Bucket ${this.cfg.bucket} created`);
      } catch (err) {
        this.logger.warn(
          `Could not ensure bucket ${this.cfg.bucket} (${(err as Error).message}). Storage will fail at first use.`,
        );
      }
    }
  }

  /** Build a deterministic key for an uploaded file. */
  buildKey(scope: string, filename: string): string {
    const safe = filename.replace(/[^A-Za-z0-9._-]/g, '_');
    return `${scope}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safe}`;
  }

  async putObject(
    key: string,
    body: Buffer | Readable | Uint8Array | string,
    contentType?: string,
  ): Promise<{ key: string }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.cfg.bucket,
        Key: key,
        Body: body as any,
        ContentType: contentType,
        ServerSideEncryption: ServerSideEncryption.AES256,
      }),
    );
    return { key };
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.cfg.bucket, Key: key }),
    );
  }

  /** Time-limited download URL — charge.docx §Security. */
  async getSignedDownloadUrl(key: string, ttlSeconds?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.cfg.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: ttlSeconds ?? this.cfg.signedUrlTtlSeconds,
    });
  }

  /** Stream the body for direct server-side proxying. */
  async getObjectStream(key: string): Promise<Readable> {
    const out = await this.client.send(
      new GetObjectCommand({ Bucket: this.cfg.bucket, Key: key }),
    );
    return out.Body as Readable;
  }
}
