import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { VideosService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
    constructor(
        private readonly videosService: VideosService,
        private readonly uploadService: UploadService,
    ) { }

    @Post()
    @Roles(UserRoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new video with YouTube embed HTML' })
    @ApiBody({
        description: 'Criação de vídeo com embed completo do YouTube',
        schema: {
            type: 'object',
            properties: {
                description: { type: 'string', example: 'Conheça nossa nova coleção!' },
                embed: {
                    type: 'string',
                    example: '<iframe width="560" height="315" src="https://www.youtube.com/embed/abc123" frameborder="0" allowfullscreen></iframe>',
                },
                isFeatured: { type: 'boolean' }
            },
        },
    })
    async create(@Body() dto: CreateVideoDto): Promise<StandardResponse> {
        const result = await this.videosService.create(dto)

        return {
            data: result,
            message: ResponseMessageEnum.VIDEO_CREATED_SUCCESSFULLY,
        };
    }

    @Get()
    @ApiOperation({ summary: 'List all videos' })
    async findAll(): Promise<StandardResponse> {
        const result = await this.videosService.findAll();
        return {
            data: result,
            message: ResponseMessageEnum.BANNERS_FETCHED_SUCCESSFULLY,
        };
    }

    @Delete(':id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete a video' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.videosService.remove(id);
        return {
            data: result,
            message: ResponseMessageEnum.BANNER_DELETED_SUCCESSFULLY,
        };
    }
}
