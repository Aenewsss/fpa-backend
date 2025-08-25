import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';
import { PostStatus } from '@prisma/client';
import { FileSizeInterceptor } from 'src/common/interceptors/file-size.interceptor';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly uploadsService: UploadService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR, UserRoleEnum.EDITOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('thumbnail'),
        new FileSizeInterceptor({
            thumbnail: 5 * 1024 * 1024, //10MB
        }))

    @ApiBody({
        description: 'Criar post com thumbnail',
        schema: {
            type: 'object',
            properties: {
                postTitle: { type: 'string' },
                postContent: { type: 'object' },
                // postAuthorId: { type: 'string', format: 'uuid' },
                postStatus: { type: 'string', enum: Object.values(PostStatus) },
                postParentId: { type: 'string', format: 'uuid' },
                postCategoryId: { type: 'string', format: 'uuid' },
                relatedTags: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                },
                slug: { type: 'string' },
                summary: { type: 'string' },
                isFeatured: { type: 'boolean' },
                viewCount: { type: 'integer' },
                tagIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                },
                thumbnail: {
                    type: 'string',
                    format: 'binary',
                    description: 'Imagem de capa do post (até 5MB)',
                },
            },
            required: ['postTitle', 'postContent', 'postAuthorId', 'postStatus', 'postCategoryId', 'slug', 'tagIds', 'relatedTags'],
        },
    })
    async create(
        @Body() dto: CreatePostDto,
        @UserId() userId: string,
        @UploadedFile(new ParseFilePipe({ fileIsRequired: false, validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })] }))
        file?: Express.Multer.File,
    ): Promise<StandardResponse> {
        if (file) {
            const uploaded = await this.uploadsService.upload(file, BucketPrefixEnum.POSTS);
            dto.thumbnailUrl = uploaded.url;
        }

        const result = await this.postsService.create(dto, userId);
        return {
            data: result,
            message: ResponseMessageEnum.POST_CREATED_SUCCESSFULLY,
        };
    }

    @Get()
    @ApiOperation({ summary: 'List all posts with pagination' })
    async findAll(@Query() query: PaginationQueryDto): Promise<StandardResponse> {
        const result = await this.postsService.findAll(query);
        return {
            data: result,
            message: ResponseMessageEnum.POSTS_LISTED_SUCCESSFULLY,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get post by ID' })
    async findOne(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.postsService.findOne(id);
        return {
            data: result,
            message: ResponseMessageEnum.POST_FOUND_SUCCESSFULLY,
        };
    }

    @Patch(':id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
    @ApiOperation({ summary: 'Update post by ID' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePostDto
    ): Promise<StandardResponse> {
        const result = await this.postsService.update(id, dto);
        return {
            data: result,
            message: ResponseMessageEnum.POST_UPDATED_SUCCESSFULLY,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete post by ID' })
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.postsService.remove(id);
        return {
            data: result,
            message: ResponseMessageEnum.POST_DELETED_SUCCESSFULLY,
        };
    }

    @Post('uploads')
    @UseInterceptors(FileInterceptor('file'))
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR, UserRoleEnum.EDITOR)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        return this.uploadsService.upload(file, BucketPrefixEnum.POSTS);
    }
}
