// dto/create-banner.dto.ts
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    description: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    embed: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean
}