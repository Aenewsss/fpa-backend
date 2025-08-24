import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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
    create(@Body() dto: CreateTagDto) {
        return this.tagsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as tags' })
    findAll() {
        return this.tagsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar uma tag por ID' })
    findOne(@Param('id') id: string) {
        return this.tagsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar tag' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
        return this.tagsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover tag (soft delete)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    remove(@Param('id') id: string) {
        return this.tagsService.remove(id);
    }
}