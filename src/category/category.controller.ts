// src/category/category.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@ApiTags('category')
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @ApiOperation({ summary: 'Create a category' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    async create(@Body() dto: CreateCategoryDto): Promise<StandardResponse> {
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
    async findAll(): Promise<StandardResponse> {
        const result = await this.categoryService.findAll();
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
}