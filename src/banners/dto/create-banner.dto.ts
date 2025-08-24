// dto/create-banner.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    imageUrl: any;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    link?: string;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @IsInt()
    order?: number;
}