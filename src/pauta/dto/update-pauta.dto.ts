import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePautaDto {
    @ApiProperty({ required: false })
    @IsOptional()
    imageUrl?: string;
}