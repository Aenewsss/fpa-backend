// src/category/category.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CategoryService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
        private readonly uploadService: UploadService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a category' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Upload de banner com imagem',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                name: { type: 'string' },
                slug: { type: 'string' },
                description: { type: 'string' },
                parentId: { type: 'string' },
                order: { type: 'number' },
                isVisible: { type: 'boolean' },
                color: { type: 'string' },
                isFeatured: { type: 'boolean' },
            },
        },
    })
    async create(@Body() dto: CreateCategoryDto, @UploadedFile() file: Express.Multer.File): Promise<StandardResponse> {
        if (file) {
            const uploadedFile = await this.uploadService.upload(file, BucketPrefixEnum.CATEGORIES);
            dto.thumbnailUrl = uploadedFile.url
        }

        if (dto.isFeatured) dto.isFeatured = dto.isFeatured == "true"

        const result = await this.categoryService.create(dto);
        return {
            data: result,
            message: ResponseMessageEnum.CATEGORY_CREATED_SUCCESSFULLY
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'List one category' })
    async findOne(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.categoryService.findOne(id)
        return {
            data: result,
            message: ResponseMessageEnum.CATEGORY_LISTED_SUCCESSFULLY
        }
    }

    @Get()
    @ApiOperation({ summary: 'List all category' })
    async findAll(@Query() query: PaginationQueryDto): Promise<StandardResponse> {
        const result = await this.categoryService.findAll(query);
        return {
            data: result,
            message: ResponseMessageEnum.CATEGORIES_LISTED_SUCCESSFULLY
        }
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a category' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<StandardResponse> {
        const result = await this.categoryService.update(id, dto)
        return {
            data: result,
            message: ResponseMessageEnum.CATEGORY_UPDATED_SUCCESSFULLY
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a category' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.categoryService.remove(id)
        return {
            data: result,
            message: ResponseMessageEnum.CATEGORY_DELETED_SUCCESSFULLY
        }
    }

    @Patch(':id/reorder/:newIndex')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Reorder a webstory' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async reorder(@Param('id') id: string, @Param('newIndex') newIndex: number): Promise<StandardResponse> {
        const result = await this.categoryService.reorder(id, newIndex);
        return {
            data: result,
            message: ResponseMessageEnum.WEBSTORY_ORDER_UPDATED,
        };
    }
}