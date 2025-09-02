import { Body, Controller, Post } from '@nestjs/common'
import { MailService } from './mail.service'
import { SubscribeNewsletterDto } from './dto/subscribe.dto'
import { StandardResponse } from 'src/common/interfaces/standard-response.interface'
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum'

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    @Post('newsletter')
    async subscribeToNewsletter(@Body() body: SubscribeNewsletterDto): Promise<StandardResponse> {
        const result = await this.mailService.sendNewsletterConfirmation(body.name, body.email)
        return {
            data: result,
            message: ResponseMessageEnum.NEWSLETTER_SUBSCRIBE_SUCCESSFULLY
        }
    }
}