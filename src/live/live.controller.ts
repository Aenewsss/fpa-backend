import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { LiveService } from './live.service';
import { UpdateLiveDto } from './dto/update-live.dto';

@Controller('live')
export class LiveController {
    constructor(
        private readonly liveService: LiveService
    ) { }

    @Put()
    @ApiOperation({ summary: 'Atualizar live' })
    @ApiResponse({ status: 201, description: 'Live atualizada com sucesso' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    async create(@Body() dto: UpdateLiveDto): Promise<StandardResponse> {
        const result = await this.liveService.update(dto);
        return {
            message: ResponseMessageEnum.TAG_CREATED_SUCCESSFULLY,
            data: result
        }
    }

    @ApiOperation({ summary: 'Buscar a live' })
    @Get()
    async findOne(): Promise<StandardResponse> {
        const result = await this.liveService.findOne();
        return {
            message: ResponseMessageEnum.TAG_LISTED_SUCCESSFULLY,
            data: result
        }
    }
}
