import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';
import { PostStatus } from '@prisma/client';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly uploadsService: UploadService
    ) { }

    private replaceImageSrcsByFilename(
        postContent: any,
        uploadedFiles: { filename: string, url: string }[]
    ): any {
        const updatedContent = postContent.content.map((node: any) => {
            if (node.type === 'image' && node.attrs?.title) {
                const match = uploadedFiles.find(file => file.filename === node.attrs.title)

                if (match) {
                    return {
                        ...node,
                        attrs: {
                            ...node.attrs,
                            src: match.url
                        }
                    }
                }
            }

            return node
        })

        return {
            ...postContent,
            content: updatedContent
        }
    }

    @Get('most-viewed')
    async mostViewed(): Promise<StandardResponse> {
        const result = await this.postsService.mostViewed();
        return {
            data: result,
            message: ResponseMessageEnum.POSTS_LISTED_SUCCESSFULLY,
        };
    }

    @Get('removed')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar matérias removidas (soft delete)' })
    async listRemovedPosts(): Promise<StandardResponse> {
        const data = await this.postsService.findRemoved();
        return {
            data,
            message: ResponseMessageEnum.LIST_REMOVED_POSTS_SUCCESSFULLY,
        };
    }

    @Post()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR, UserRoleEnum.EDITOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'files', maxCount: 5 },
            { name: 'thumbnailFile', maxCount: 1 },
        ])
    )
    @ApiBody({
        description: 'Criar post',
        schema: {
            type: 'object',
            properties: {
                postTitle: { type: 'string' },
                postContent: { type: 'string' },
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
                isFeatured: { type: 'string' },
                viewCount: { type: 'integer' },
                tagIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                },
            },
            required: ['postTitle', 'postContent', 'postStatus', 'postCategoryId', 'slug'],
        },
    })
    async create(
        @Body() dto: any,
        @UserId() userId: string,
        @UploadedFiles() files: { thumbnailFile: Express.Multer.File, files?: Express.Multer.File[] },
    ): Promise<StandardResponse> {
        if (!files.thumbnailFile[0]) {
            throw new Error('THUMBNAIL_REQUIRED')
        }

        const uploadedFile = await this.uploadsService.upload(files.thumbnailFile[0], `${BucketPrefixEnum.POSTS}thumbnail/${dto.slug}`);
        dto.thumbnailUrl = uploadedFile.url

        let postContent: object

        if (files && files.files?.length) {
            const uploads = await Promise.all(
                files.files.map(async file => ({
                    url: (await this.uploadsService.upload(file, `${BucketPrefixEnum.POSTS}${dto.slug}`)).url,
                    filename: file.originalname.split('.').slice(0, -1).join('.')
                }))
            )

            postContent = this.replaceImageSrcsByFilename(JSON.parse(dto.postContent), uploads)
        } else {
            postContent = JSON.parse(dto.postContent)
        }

        dto.postContent = postContent
        dto.isFeatured = dto.isFeatured === 'true'

        console.log('line 144:',userId)
        const result = await this.postsService.create(dto, userId);
        return {
            data: result,
            message: ResponseMessageEnum.POST_CREATED_SUCCESSFULLY,
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing post' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR, UserRoleEnum.EDITOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'files', maxCount: 5 },
            { name: 'thumbnailFile', maxCount: 1 },
        ])
    )
    @ApiBody({
        description: 'Atualizar post existente',
        schema: {
            type: 'object',
            properties: {
                postTitle: { type: 'string' },
                postContent: { type: 'string' },
                postStatus: { type: 'string', enum: Object.values(PostStatus) },
                postCategoryId: { type: 'string', format: 'uuid' },
                relatedTags: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                },
                slug: { type: 'string' },
                summary: { type: 'string' },
                isFeatured: { type: 'string' },
                viewCount: { type: 'integer' },
                tagIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                },
            },
        },
    })
    async update(
        @Param('id') id: string,
        @UserId() userId: string,
        @UploadedFiles() files: { thumbnailFile?: Express.Multer.File[], files?: Express.Multer.File[] },
        @Body() dto: any,
    ): Promise<StandardResponse> {
        let updatedThumbnailUrl: string | undefined
        let postContent: object

        // ✅ Upload thumbnail only if provided
        if (files.thumbnailFile && files.thumbnailFile.length > 0) {
            const uploadedThumbnail = await this.uploadsService.upload(
                files.thumbnailFile[0],
                `${BucketPrefixEnum.POSTS}thumbnail/${dto.slug}`,
            )
            updatedThumbnailUrl = uploadedThumbnail.url
            dto.thumbnailUrl = updatedThumbnailUrl
        }

        // ✅ Upload inline content files if provided
        if (files.files && files.files.length > 0) {
            const uploads = await Promise.all(
                files.files.map(async (file) => ({
                    url: (await this.uploadsService.upload(file, `${BucketPrefixEnum.POSTS}${dto.slug}`)).url,
                    filename: file.originalname.split('.').slice(0, -1).join('.'),
                })),
            )

            postContent = this.replaceImageSrcsByFilename(JSON.parse(dto.postContent), uploads)
        } else {
            // keep content unchanged or update with JSON provided
            postContent = JSON.parse(dto.postContent)
        }

        dto.postContent = postContent
        dto.isFeatured = dto.isFeatured === 'true'

        const result = await this.postsService.update(id, dto)

        return {
            data: result,
            message: ResponseMessageEnum.POST_UPDATED_SUCCESSFULLY,
        }
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

    @Get('featured')
    @ApiOperation({ summary: 'List all posts with pagination' })
    async findFeatured(): Promise<StandardResponse> {
        const result = await this.postsService.findFeatured();
        return {
            data: result,
            message: ResponseMessageEnum.POSTS_LISTED_SUCCESSFULLY,
        };
    }

    @Get('category/featured/')
    @ApiOperation({ summary: 'List all posts with pagination' })
    async findCategoryFeatured(): Promise<StandardResponse> {
        const result = await this.postsService.findCategoryFeatured();
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

    @Post(':id/view')
    async incrementView(@Param('id') id: string): Promise<void> {
        await this.postsService.increment(id);
    }

    @Post(':id/restore')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Restaurar uma matéria removida' })
    async restorePost(@Param('id') id: string): Promise<StandardResponse> {
        const data = await this.postsService.restore(id);
        return {
            data,
            message: ResponseMessageEnum.POST_RESTORED_SUCCESSFULLY,
        };
    }
}
