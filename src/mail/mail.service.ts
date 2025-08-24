// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as sendpulse from 'sendpulse-api'

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly TOKEN_STORAGE = '/tmp/sendpulse_token.json'; // Pode ser qualquer caminho válido no seu sistema

    constructor() {
        sendpulse.init(process.env.SENDPULSE_API_USER_ID, process.env.SENDPULSE_API_SECRET, this.TOKEN_STORAGE,
            (token) => {
                if (token) {
                    this.logger.log('SendPulse authenticated successfully');
                } else {
                    this.logger.error('SendPulse authentication failed');
                }
            }
        );
    }

    async sendPasswordResetCode(to: string, code: string) {
        const url = `https://seu-dominio.com.br/primeiro-acesso?email=${encodeURIComponent(to)}&code=${code}`;

        const emailData = {
            html: '',
            subject: 'Código de redefinição de senha',
            from: {
                name: process.env.SENDPULSE_FROM_NAME || 'Sistema',
                email: process.env.SENDPULSE_FROM_EMAIL!,
            },
            to: [
                {
                    email: to,
                    name: to,
                },
            ],
            template: {
                id: Number(process.env.SENDPULSE_TEMPLATE_ID!),
                variables: {
                    code,
                    url
                },
            },
        };

        return new Promise((resolve, reject) => {
            sendpulse.smtpSendMail((res) => {
                if (res?.result === true) {
                    this.logger.log(`Código de redefinição enviado para ${to}`);
                    resolve(res);
                } else {
                    this.logger.error(`Erro ao enviar código para ${to}:`, res);
                    reject(res);
                }
            }, emailData);
        });
    }
}