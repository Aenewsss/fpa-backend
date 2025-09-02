import { Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { MagazineService } from './magazine.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';

@Controller('magazine')
export class MagazineController {
    constructor(
        private readonly magazineService: MagazineService,
        private readonly uploadService: UploadService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Listar revista' })
    async find(): Promise<StandardResponse> {
        const result = await this.magazineService.find();
        return {
            message: ResponseMessageEnum.MAGAZINE_LISTED_SUCCESSFULLY,
            data: result
        }
    }

    @Post()
    @ApiOperation({ summary: 'Criar ou atualizar revista' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        }),
    )
    @ApiConsumes('multipart/form-data')
    async createOrUpdate(@UploadedFile() file: Express.Multer.File): Promise<StandardResponse> {
        const uploadedFile = await this.uploadService.upload(file, BucketPrefixEnum.MAGAZINE);
        const pdfUrl = uploadedFile.url

        if (uploadedFile.duplicated) {
            return {
                data: uploadedFile,
                message: ResponseMessageEnum.BANNER_ALREADY_EXISTS,
            };
        }

        const result = await this.magazineService.createOrUpdate(pdfUrl);
        return {
            message: ResponseMessageEnum.MAGAZINE_CREATED_SUCCESSFULLY,
            data: result
        }
    }
}
