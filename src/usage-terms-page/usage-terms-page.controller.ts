import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UsageTermsPageService } from './usage-terms-page.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { UpdatePageDto } from 'src/common/dto/update-page.dto';

@Controller('usage-terms-page')
export class UsageTermsPageController {
    constructor(
        private readonly service: UsageTermsPageService
    ) { }

    @Put()
    @ApiOperation({ summary: 'Atualizar página `termos de uso`' })
    @ApiResponse({ status: 201, description: 'Página `termos de uso` atualizada com sucesso' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    async create(@Body() dto: UpdatePageDto): Promise<StandardResponse> {
        const result = await this.service.update(dto);
        return {
            message: ResponseMessageEnum.USAGE_TERMS_PAGE_UPDATED_SUCCESSFULLY,
            data: result
        }
    }

    @ApiOperation({ summary: 'Buscar a página `termos de uso`' })
    @Get()
    async findOne(): Promise<StandardResponse> {
        const result = await this.service.findOne();
        return {
            message: ResponseMessageEnum.USAGE_TERMS_PAGE_FETCHED_SUCCESSFULLY,
            data: result
        }
    }
}
