// dto/create-banner.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
    @ApiProperty()
    @IsString()
    photoUrl: any;

    @ApiProperty()
    @IsString()
    name: string;
}