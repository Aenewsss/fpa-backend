// src/uploads/upload-r2.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { createHash, randomUUID } from 'crypto';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
    private s3: S3Client;
    private bucket: string;

    constructor() {
        this.s3 = new S3Client({
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY!,
                secretAccessKey: process.env.R2_SECRET_KEY!,
            },
        });

        this.bucket = process.env.R2_BUCKET!;
    }

    async getSignedUrl(filename: string, contentType: string, pathPrefix: string) {
        const key = `${pathPrefix}/${Date.now()}-${filename}`;
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(this.s3 as any, command as any, { expiresIn: 3600 });

        return {
            url,        // presigned PUT url
            key,        // s3 key
            publicUrl: `${process.env.R2_PUBLIC_BASE_URL}/${key}`, // final file URL
        };
    }

    async upload(file: Express.Multer.File, pathPrefix: BucketPrefixEnum | string) {
        const extension = extname(file.originalname);
        const hash = createHash('sha256').update(file.buffer).digest('hex');
        const filename = `${hash}${extension}`;
        const key = `${pathPrefix}/${filename}`;

        try {
            // Verifica se o arquivo já existe
            await this.s3.send(
                new HeadObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );

            // Se não lançar erro, significa que o objeto já existe
            const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
            return {
                url: publicUrl,
                key,
                size: file.size,
                contentType: file.mimetype,
                duplicated: true,
            };
        } catch (err) {
            // Se for erro diferente de NotFound, repropaga
            if (err?.$metadata?.httpStatusCode !== 404) {
                console.error('[R2 HeadObject Error]', err);
                throw new InternalServerErrorException(ResponseMessageEnum.ERROR_VERIFYING_FILE);
            }

            // Arquivo ainda não existe, pode fazer o upload
            try {
                await this.s3.send(
                    new PutObjectCommand({
                        Bucket: this.bucket,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                        CacheControl: 'public, max-age=31536000', // cache por 1 ano
                    }),
                );

                const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
                return {
                    url: publicUrl,
                    key,
                    size: file.size,
                    contentType: file.mimetype,
                    duplicated: false,
                };
            } catch (uploadErr) {
                console.error('[R2 Upload Error]', uploadErr);
                throw new InternalServerErrorException(ResponseMessageEnum.ERROR_TO_UPLOAD_FILE);
            }
        }
    }
}