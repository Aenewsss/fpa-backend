import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, Query } from '@nestjs/common';
import { RelevantsService } from './relevants.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { FileSizeInterceptor } from 'src/common/interceptors/file-size.interceptor';

@ApiTags('Relevants')
@Controller('relevants')
@ApiBearerAuth()
export class RelevantsController {
    constructor(
        private readonly service: RelevantsService,
        private readonly uploadService: UploadService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new relevant' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiConsumes('multipart/form-data')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'videoFile', maxCount: 1 },
            { name: 'coverFile', maxCount: 1 },
        ]),
        new FileSizeInterceptor({
            videoFile: 10 * 1024 * 1024, //10MB
            coverFile: 5 * 1024 * 1024, //10MB
        })
    ) @ApiBody({
        description: 'Upload de Webstory com vídeo e capa',
        schema: {
            type: 'object',
            properties: {
                videoFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo de vídeo vertical (obrigatório)',
                },
                coverFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'Imagem de capa do vídeo (opcional)',
                },
                title: {
                    type: 'string',
                    example: 'Conheça nossa nova coleção!',
                },
                description: {
                    type: 'string',
                    example: 'Essa coleção foi feita pensando em você.',
                },
            },
            required: ['videoFile', 'title'],
        },
    })
    async create(
        @UploadedFiles()
        files: { videoFile: Express.Multer.File, coverFile?: Express.Multer.File },
        @Body() dto: any
    ): Promise<StandardResponse> {
        const { videoFile, coverFile: imageFile } = files
        console.log(files)
        if (!videoFile) throw new Error(ResponseMessageEnum.VIDEO_FILE_REQUIRED);

        const uploadedVideo = await this.uploadService.upload(videoFile[0], BucketPrefixEnum.RELEVANTS_VIDEO);
        dto.videoUrl = uploadedVideo.url;

        if (imageFile) {
            const uploadedImage = await this.uploadService.upload(imageFile[0], BucketPrefixEnum.RELEVANTS_COVER);
            dto.coverImageUrl = uploadedImage.url;
        }

        if (uploadedVideo.duplicated) {
            return {
                data: uploadedVideo,
                message: ResponseMessageEnum.RELEVANT_ALREADY_EXISTS,
            };
        }

        const result = await this.service.create({ ...dto });
        return {
            data: result,
            message: ResponseMessageEnum.RELEVANT_CREATED_SUCCESSFULLY,
        };
    }

    @Get()
    @ApiOperation({ summary: 'List all Relevants' })
    async findAll(@Query() query: PaginationQueryDto): Promise<StandardResponse> {
        const result = await this.service.findAll(query);
        return {
            data: result,
            message: ResponseMessageEnum.RELEVANTS_LISTED_SUCCESSFULLY
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get relevant by ID' })
    async findOne(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.service.findOne(id);
        return { data: result, message: ResponseMessageEnum.RELEVANT_LISTED_SUCCESSFULLY }
    }

    // @Patch(':id')
    // @ApiOperation({ summary: 'Update a relevant' })
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(UserRoleEnum.ADMIN)
    // update(@Param('id') id: string, @Body() dto: UpdateWebstoryDto) {
    //     return this.service.update(id, dto);
    // }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete a relevant' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.service.remove(id)
        return {
            data: result,
            message: ResponseMessageEnum.RELEVANT_DELETED_SUCCESSFULLY
        }
    }

    @Patch(':id/reorder/:newIndex')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Reorder a webstory' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async reorder(@Param('id') id: string, @Param('newIndex') newIndex: number): Promise<StandardResponse> {
        const result = await this.service.reorder(id, newIndex);
        return {
            data: result,
            message: ResponseMessageEnum.RELEVANT_ORDER_UPDATED,
        };
    }
}