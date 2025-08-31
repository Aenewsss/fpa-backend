// dto/create-banner.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    url: any;

    @ApiProperty({ required: false })
    @IsString()
    description: string;
}