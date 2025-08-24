import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { DashboardService } from './dashboard.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {

    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @Get('monthly-summary')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.EDITOR, UserRoleEnum.MAIN_EDITOR)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getMonthlySummary(): Promise<StandardResponse> {
        const result = await this.dashboardService.getMonthlySummary();
        return { data: result, message: ResponseMessageEnum.DASHBOARD_MONTHLY_SUMMARY_SUCCESS };
    }

    @Get('content-overview')
    @ApiOperation({ summary: 'Resumo geral do conteúdo' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MAIN_EDITOR, UserRoleEnum.EDITOR)
    async getOverview(): Promise<StandardResponse> {
        const result = await this.dashboardService.getContentOverview()
        return {
            data: result,
            message: ResponseMessageEnum.DASHBOARD_CONTENT_OVERVIEW_FETCHED
        }
    }
}
