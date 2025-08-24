// src/auth/dto/signup-reader.dto.ts
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupReaderDto {
    @ApiProperty()
    @IsString()
    @MinLength(4)
    firstName: string;

    @ApiProperty()
    @IsString()
    @MinLength(4)
    lastName: string;

    @ApiProperty()
    @IsString()
    @MinLength(4)
    jobRole: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])/, {
        message: 'A senha deve conter maiúscula, minúscula, número e caractere especial',
    })
    password: string;

    @ApiProperty()
    @IsString()
    repeatPassword: string;
}