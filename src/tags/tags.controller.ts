
import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    @ApiOperation({ summary: 'Criar nova tag' })
    @ApiResponse({ status: 201, description: 'Tag criada com sucesso' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    async create(@Body() dto: CreateTagDto): Promise<StandardResponse> {
        const result = await this.tagsService.create(dto);
        return {
            message: ResponseMessageEnum.TAG_CREATED_SUCCESSFULLY,
            data: result
        }
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as tags' })
    async findAll(@Query() query: PaginationQueryDto): Promise<StandardResponse> {
        const result = await this.tagsService.findAll(query);
        return {
            message: ResponseMessageEnum.TAGS_LISTED_SUCCESSFULLY,
            data: result
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar uma tag por ID' })
    async findOne(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.tagsService.findOne(id);
        return {
            message: ResponseMessageEnum.TAG_LISTED_SUCCESSFULLY,
            data: result
        }
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar tag' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateTagDto): Promise<StandardResponse> {
        const result = await this.tagsService.update(id, dto);
        return {
            message: ResponseMessageEnum.TAG_UPDATED_SUCCESSFULLY,
            data: result
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover tag (soft delete)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.tagsService.remove(id);
        return {
            message: ResponseMessageEnum.TAG_DELETED_SUCCESSFULLY,
            data: result
        }
    }
}