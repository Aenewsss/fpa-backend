import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebstoryDto {
    @ApiProperty({ example: 'Como aproveitar o verão em 30 segundos' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        example: 'https://cdn.seudominio.com.br/webstories/abc123.mp4',
    })
    @IsNotEmpty()
    @IsUrl()
    @IsOptional()
    videoUrl: string;

    @ApiProperty({
        example: 'https://cdn.seudominio.com.br/thumbnails/abc123.jpg',
        required: false,
    })
    @IsOptional()
    @IsUrl()
    coverImageUrl?: string;

    @ApiProperty({
        example: 'Dicas rápidas para curtir o verão com saúde e estilo.',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}