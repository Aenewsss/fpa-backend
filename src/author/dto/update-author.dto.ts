import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateAuthorDto {
    @ApiPropertyOptional({ description: 'Author name' })
    @IsString()
    name?: string;
}