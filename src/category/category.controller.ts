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

@ApiTags('category')
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @ApiOperation({ summary: 'Create a category' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'List one category' })
    findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id);
    }

    @Get()
    @ApiOperation({ summary: 'List all category' })
    findAll() {
        return this.categoryService.findAll();
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a category' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a category' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.categoryService.remove(id);
    }
}