import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RelevantsService } from './relevants.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { UploadService } from 'src/uploads/upload.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';

@ApiTags('Relevants')
@Controller('relevants')
@ApiBearerAuth()
export class RelevantsController {
    constructor(
        private readonly service: RelevantsService,
        private readonly uploadService: UploadService
    ) { }

    @Get('signed-url')
    async getSignedUrl(
        @Query('filename') filename: string,
        @Query('contentType') contentType: string,
    ): Promise<StandardResponse> {
        const result = await this.uploadService.getSignedUrl(filename, contentType, "relevants");
        return {
            data: result,
            message: ResponseMessageEnum.GET_RELEVANT_SIGNED_URL_SUCCESSFULLY
        }
    }

    @Post()
    @ApiOperation({ summary: 'Create a new relevant' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBody({
        description: 'Create a new relevant (video and cover already uploaded to R2)',
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Conheça nossa nova coleção!' },
                description: { type: 'string', example: 'Essa coleção foi feita pensando em você.' },
                videoKey: { type: 'string', example: 'relevants/video/123abc.mp4' },
                coverKey: { type: 'string', example: 'relevants/cover/123abc.jpg' },
            },
            required: ['title', 'videoKey'],
        },
    })
    async create(@Body() dto: any): Promise<StandardResponse> {
        if (!dto.videoKey) {
            throw new Error(ResponseMessageEnum.VIDEO_FILE_REQUIRED);
        }

        // Convert S3 keys into public URLs
        dto.videoUrl = `${process.env.R2_PUBLIC_BASE_URL}/${dto.videoKey}`;
        if (dto.coverKey) {
            dto.coverImageUrl = `${process.env.R2_PUBLIC_BASE_URL}/${dto.coverKey}`;
        }

        const { videoKey, ...rest } = dto

        const result = await this.service.create({ ...rest });

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