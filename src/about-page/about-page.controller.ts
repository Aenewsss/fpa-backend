import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AboutPageService } from './about-page.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { UpdatePageDto } from 'src/common/dto/update-page.dto';

@Controller('about-page')
export class AboutPageController {
    constructor(
        private readonly service: AboutPageService
    ) { }

    @Put()
    @ApiOperation({ summary: 'Atualizar página `sobre`' })
    @ApiResponse({ status: 201, description: 'Página `sobre` atualizada com sucesso' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    async create(@Body() dto: UpdatePageDto): Promise<StandardResponse> {
        const result = await this.service.update(dto);
        return {
            message: ResponseMessageEnum.ABOUT_PAGE_UPDATED_SUCCESSFULLY,
            data: result
        }
    }

    @ApiOperation({ summary: 'Buscar a página `sobre`' })
    @Get()
    async findOne(): Promise<StandardResponse> {
        const result = await this.service.findOne();
        return {
            message: ResponseMessageEnum.ABOUT_PAGE_FETCHED_SUCCESSFULLY,
            data: result
        }
    }
}
