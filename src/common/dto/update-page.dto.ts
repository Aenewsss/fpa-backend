import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePageDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    content: any;
}