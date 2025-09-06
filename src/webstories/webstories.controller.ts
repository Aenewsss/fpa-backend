import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, Query } from '@nestjs/common';
import { WebstoriesService } from './webstories.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { randomUUID } from 'crypto';

@ApiTags('Webstories')
@Controller('webstories')
export class WebstoriesController {
    constructor(
        private readonly service: WebstoriesService,
        private readonly uploadService: UploadService
    ) { }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new webstory with image slides' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'slides', maxCount: 20 }, // até 20 imagens
        ]),
    )
    @ApiBody({
        description: 'Upload de Webstory com capa e múltiplas imagens de slides',
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'História do Agro' },
                description: { type: 'string', example: 'Do início até hoje' },
                'slideTexts[0]': {
                    type: 'string',
                    example: 'Texto do primeiro slide',
                },
                'slideTexts[1]': {
                    type: 'string',
                    example: 'Texto do segundo slide',
                },
                'slides': {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
            required: ['title', 'slides'],
        },
    })
    async create(
        @UploadedFiles(new ParseFilePipe())
        files: Record<string, Express.Multer.File[]>,
        @Body() dto: any
    ): Promise<StandardResponse> {
        const { title, description } = dto;
        const slidesFiles = files.slides ?? [];

        if (!slidesFiles || slidesFiles.length === 0) {
            throw new Error('Pelo menos um slide é obrigatório.');
        }

        const slides = await Promise.all(
            slidesFiles.map(async (file, index) => {
                const uploaded = await this.uploadService.upload(file, `${BucketPrefixEnum.WEBSTORIES}${title}`);
                return {
                    imageUrl: uploaded.url,
                    text: dto.slideTexts[index],
                    order: index,
                };
            })
        );

        const result = await this.service.create({
            title,
            description,
            slides,
        });

        return {
            data: result,
            message: ResponseMessageEnum.WEBSTORY_CREATED_SUCCESSFULLY,
        };
    }

    @Get()
    @ApiOperation({ summary: 'List all webstories' })
    async findAll(@Query() query: PaginationQueryDto): Promise<StandardResponse> {
        const result = await this.service.findAll(query);
        return {
            data: result,
            message: ResponseMessageEnum.WEBSTORIES_LISTED_SUCCESSFULLY
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get webstory by ID' })
    async findOne(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.service.findOne(id);
        return { data: result, message: ResponseMessageEnum.WEBSTORY_LISTED_SUCCESSFULLY }
    }

    // @Patch(':id')
    // @ApiOperation({ summary: 'Update a webstory' })
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(UserRoleEnum.ADMIN)
    // update(@Param('id') id: string, @Body() dto: UpdateWebstoryDto) {
    //     return this.service.update(id, dto);
    // }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete a webstory' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.service.remove(id)
        return {
            data: result,
            message: ResponseMessageEnum.WEBSTORY_DELETED_SUCCESSFULLY
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
            message: ResponseMessageEnum.WEBSTORY_ORDER_UPDATED,
        };
    }
}