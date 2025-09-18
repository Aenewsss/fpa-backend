import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

class WebstorySlideDto {
    @ApiProperty({
        example: 'https://cdn.seudominio.com.br/webstories/slide1.jpg',
    })
    @IsNotEmpty()
    @IsUrl()
    imageUrl: string;

    @ApiProperty({
        example: 'Texto para este slide',
        required: false,
    })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiProperty({
        example: 0,
        required: false,
    })
    @IsOptional()
    order?: number;
}

export class CreateWebstoryDto {
    @ApiProperty({ example: 'Como aproveitar o verão em 30 segundos' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        example: 'Dicas rápidas para curtir o verão com saúde e estilo.',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        type: [WebstorySlideDto],
        description: 'Lista de slides com imagem e texto',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WebstorySlideDto)
    slides: WebstorySlideDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    isFeatured?: boolean = false;
}