// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    }

    async sendPasswordResetCode(to: string, code: string) {
        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL!,
                name: process.env.SENDGRID_FROM_NAME || 'Sistema',
            },
            templateId: process.env.SENDGRID_TEMPLATE_RESET_CODE_ID!,
            dynamicTemplateData: {
                code,
            },
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Código de redefinição enviado para ${to}`);
        } catch (error) {
            this.logger.error(`Erro ao enviar código para ${to}:`, error?.response?.body || error);
            throw error;
        }
    }
}