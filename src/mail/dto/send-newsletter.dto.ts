import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class SendNewsletterDto {
    @IsNotEmpty()
    @ApiProperty()
    id: string

    @IsNotEmpty()
    @ApiProperty()
    subject: string
}
