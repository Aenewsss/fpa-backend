import { Body, Controller, Get, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { UpdatePautaDto } from './dto/update-pauta.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/uploads/upload.service';
import { PautaService } from './pauta.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Controller('pauta')
export class PautaController {
    constructor(
        private readonly uploadService: UploadService,
        private readonly pautaService: PautaService,
    ) { }

    @Put()
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
        description: 'Upload de pauta com imagem',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Update pauta' })
    async update(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UpdatePautaDto,
    ): Promise<StandardResponse> {
        const uploadedFile = await this.uploadService.upload(file, BucketPrefixEnum.PAUTA);
        dto.imageUrl = uploadedFile.url

        if (uploadedFile.duplicated) {
            return {
                data: uploadedFile,
                message: ResponseMessageEnum.PAUTA_ALREADY_EXISTS,
            };
        }

        const result = await this.pautaService.update({ ...dto });

        return {
            data: result,
            message: ResponseMessageEnum.PAUTA_CREATED_SUCCESSFULLY,
        };
    }

    @ApiOperation({ summary: 'Buscar a pauta' })
    @Get()
    async findOne(): Promise<StandardResponse> {
        const result = await this.pautaService.findOne();
        return {
            message: ResponseMessageEnum.PAUTA_LISTED_SUCCESSFULLY,
            data: result
        }
    }
}
