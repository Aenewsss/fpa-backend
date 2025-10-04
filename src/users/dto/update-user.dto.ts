import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/common/enums/role.enum';

export class UpdateUserDto {
    @ApiProperty({ example: 'joao@fpa.org.br', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ example: 'João', required: false })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({ example: 'Silva', required: false })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({ enum: UserRoleEnum, example: UserRoleEnum.EDITOR, required: false })
    @IsEnum(UserRoleEnum)
    @IsOptional()
    role?: UserRoleEnum;
}