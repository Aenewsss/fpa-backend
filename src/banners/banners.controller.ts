import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
    constructor(
        private readonly bannersService: BannersService,
        private readonly uploadService: UploadService,
    ) { }

    @Post()
    @Roles(UserRoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        }),
    )
    @ApiConsumes('multipart/form-data') // ✅ necessário
    @ApiBody({
        description: 'Upload de banner com imagem',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                text: {
                    type: 'string',
                    example: 'Conheça nossa nova coleção!',
                },
                link: {
                    type: 'string',
                    example: 'https://seusite.com.br/colecao',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Create a new banner' })
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateBannerDto,
    ): Promise<StandardResponse> {
        const uploadedFile = await this.uploadService.upload(file, BucketPrefixEnum.BANNERS);
        dto.imageUrl = uploadedFile.url

        if (uploadedFile.duplicated) {
            return {
                data: uploadedFile,
                message: ResponseMessageEnum.BANNER_ALREADY_EXISTS,
            };
        }

        const result = await this.bannersService.create({ ...dto });

        return {
            data: result,
            message: ResponseMessageEnum.BANNER_CREATED_SUCCESSFULLY,
        };
    }

    @Get()
    @ApiOperation({ summary: 'List all banners' })
    async findAll(): Promise<StandardResponse> {
        const result = await this.bannersService.findAll();
        return {
            data: result,
            message: ResponseMessageEnum.BANNERS_FETCHED_SUCCESSFULLY,
        };
    }

    // @Patch(':id')
    // @Roles(UserRoleEnum.ADMIN)
    // @ApiOperation({ summary: 'Update a banner' })
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @ApiBearerAuth()
    // async update(
    //     @Param('id') id: string,
    //     @Body() dto: UpdateBannerDto,
    // ): Promise<StandardResponse> {
    //     const result = await this.bannersService.update(id, dto);
    //     return {
    //         data: result,
    //         message: ResponseMessageEnum.BANNER_UPDATED_SUCCESSFULLY,
    //     };
    // }

    @Delete(':id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete a banner' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.bannersService.remove(id);
        return {
            data: result,
            message: ResponseMessageEnum.BANNER_DELETED_SUCCESSFULLY,
        };
    }

    @Patch(':id/reorder/:newIndex')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Reorder a banner' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async reorder(@Param('id') id: string, @Param('newIndex') newIndex: number): Promise<StandardResponse> {
        const result = await this.bannersService.reorder(id, newIndex);
        return {
            data: result,
            message: ResponseMessageEnum.BANNER_ORDER_UPDATED,
        };
    }
}
