// src/auth/dto/request-reader-code.dto.ts
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestReaderCodeDto {
    @ApiProperty()
    @IsEmail()
    email: string;
}