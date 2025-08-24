import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BannersService } from './banners.service';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateBannerDto } from './dto/create-banner.dto';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { UpdateBannerDto } from './dto/update-banner.dto';

@ApiTags('Banners')
@Controller('banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    @Post()
    @Roles(UserRoleEnum.ADMIN)
    async create(@Body() dto: CreateBannerDto): Promise<StandardResponse> {
        const result = await this.bannersService.create(dto);
        return { data: result, message: ResponseMessageEnum.BANNER_CREATED_SUCCESSFULLY };
    }

    @Get()
    async findAll(): Promise<StandardResponse> {
        const result = await this.bannersService.findAll();
        return { data: result, message: ResponseMessageEnum.BANNERS_FOUND };
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.bannersService.findOne(id);
        return { data: result, message: ResponseMessageEnum.BANNER_FOUND };
    }

    @Patch(':id')
    @Roles(UserRoleEnum.ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateBannerDto): Promise<StandardResponse> {
        const result = await this.bannersService.update(id, dto);
        return { data: result, message: ResponseMessageEnum.BANNER_UPDATED_SUCCESSFULLY };
    }

    @Delete(':id')
    @Roles(UserRoleEnum.ADMIN)
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.bannersService.remove(id);
        return { data: result, message: ResponseMessageEnum.BANNER_DELETED_SUCCESSFULLY };
    }

    @Patch(':id/reorder')
    @Roles(UserRoleEnum.ADMIN)
    async reorder(
        @Param('id') id: string,
        @Body() body: { order: number },
    ): Promise<StandardResponse> {
        const result = await this.bannersService.reorder(id, body.order);
        return { data: result, message: ResponseMessageEnum.BANNER_ORDER_UPDATED };
    }
}