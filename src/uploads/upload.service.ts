// src/uploads/upload-r2.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
    private s3: S3Client;
    private bucket: string;

    constructor() {
        this.s3 = new S3Client({
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT, // ex: https://<account>.r2.cloudflarestorage.com
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY!,
                secretAccessKey: process.env.R2_SECRET_KEY!,
            },
        });

        this.bucket = process.env.R2_BUCKET!;
    }

    async upload(file: Express.Multer.File, pathPrefix = 'uploads') {
        const extension = extname(file.originalname);
        const uuid = randomUUID();

        const filename = `${uuid}${extension}`;
        const key = `${pathPrefix}/${filename}`;

        try {
            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );

            const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
            return {
                url: publicUrl,
                key,
                size: file.size,
                contentType: file.mimetype,
            };
        } catch (err) {
            console.error('[R2 Upload Error]', err);
            throw new InternalServerErrorException('Erro ao enviar para o R2');
        }
    }
}