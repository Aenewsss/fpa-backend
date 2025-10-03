import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthorService } from './author.service';
import { UploadService } from 'src/uploads/upload.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { BucketPrefixEnum } from 'src/common/enums/bucket-prefix.enum';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { CreateAuthorDto } from './dto/create-author.dto';

@Controller('author')
export class AuthorController {
    constructor(
        private readonly authorService: AuthorService,
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
        description: 'Upload de parlamentar com imagem',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                name: {
                    type: 'string',
                    example: 'José!',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Create a new author' })
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: any,
    ): Promise<StandardResponse> {
        const uploadedFile = await this.uploadService.upload(file, BucketPrefixEnum.AUTHORS);
        dto.photoUrl = uploadedFile.url

        // if (uploadedFile.duplicated) {
        //     return {
        //         data: uploadedFile,
        //         message: ResponseMessageEnum.AUTHOR_ALREADY_EXISTS,
        //     };
        // }

        const result = await this.authorService.create({ ...dto });

        return {
            data: result,
            message: ResponseMessageEnum.AUTHOR_CREATED_SUCCESSFULLY,
        };
    }

    @Get()
    @ApiOperation({ summary: 'List all authors' })
    async findAll(): Promise<StandardResponse> {
        const result = await this.authorService.findAll();
        return {
            data: result,
            message: ResponseMessageEnum.AUTHORS_FETCHED_SUCCESSFULLY,
        };
    }

    @Delete(':id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete a author' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async remove(@Param('id') id: string): Promise<StandardResponse> {
        const result = await this.authorService.remove(id);
        return {
            data: result,
            message: ResponseMessageEnum.AUTHOR_DELETED_SUCCESSFULLY,
        };
    }
}

