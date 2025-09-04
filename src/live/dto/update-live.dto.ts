import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLiveDto {
    @ApiProperty({ required: true })
    @IsString()
    link: string;

    @ApiProperty({ required: true })
    @IsBoolean()
    isEnabled: boolean;
}