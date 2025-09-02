// src/mail/mail.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as sendpulse from 'sendpulse-api'
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly TOKEN_STORAGE = '/tmp/sendpulse_token.json'; // Pode ser qualquer caminho válido no seu sistema
    private readonly senderEmail = process.env.SENDPULSE_FROM_EMAIL!;
    private readonly senderName = process.env.SENDPULSE_FROM_NAME || 'Sistema';

    constructor(
        private readonly prisma: PrismaService
    ) {
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
                name: this.senderName,
                email: this.senderEmail,
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

    async sendInvite(to: string, url: string) {
        const emailData = {
            template: {
                id: process.env.SENDPULSE_TEMPLATE_ID_INVITE,
                variables: {
                    url, // variável do seu template
                },
            },
            to: [{ email: to }],
            from: {
                name: this.senderName,
                email: this.senderEmail,
            },
            subject: 'Convite para participar do sistema',
        };

        return new Promise<void>((resolve, reject) => {
            sendpulse.smtpSendMail(
                (response: any) => {
                    if (response?.result) {
                        this.logger.log(`Convite enviado para ${to}`);
                        resolve();
                    } else {
                        this.logger.error(`Erro ao enviar convite para ${to}`, response);
                        reject(response);
                    }
                },
                emailData,
            );
        });
    }

    async sendReaderSignupCode(to: string, code: string) {
        const url = `${process.env.READER_VERIFY_URL}?email=${encodeURIComponent(to)}&code=${code}`;

        return new Promise<void>((resolve, reject) => {
            sendpulse.smtpSendMail(
                (response: any) => {
                    if (response?.result) {
                        this.logger.log(`Convite enviado para ${to}`);
                        resolve();
                    } else {
                        this.logger.error(`Erro ao enviar convite para ${to}`, response);
                        reject(response);
                    }
                },
                {
                    from: {
                        name: this.senderName,
                        email: this.senderEmail,
                    },
                    to: [{ email: to }],
                    subject: 'Código de verificação',
                    html: `<p>Seu código de verificação é: <strong>${code}</strong></p><p>Ou clique <a href="${url}">aqui</a> para acessar diretamente.</p>`,
                },
            );
        });
    }

    async sendNewsletterConfirmation(name: string, email: string) {
        const existing = await this.prisma.newsletterSubscription.findUnique({
            where: { email },
        });

        if (existing) throw new BadRequestException('Este e-mail já está inscrito na newsletter.');

        // Step 2: Create new subscription
        await this.prisma.newsletterSubscription.create({
            data: {
                name,
                email,
            },
        });
        return new Promise<void>((resolve, reject) => {
            sendpulse.smtpSendMail(
                (response: any) => {
                    if (response?.result) {
                        this.logger.log(`confirmação da newsletter enviada para ${email}`);
                        resolve();
                    } else {
                        this.logger.error(`Erro ao enviar confirmação da newsletter para ${email}`, response);
                        reject(response);
                    }
                },
                {
                    from: {
                        name: this.senderName,
                        email: this.senderEmail,
                    },
                    to: [{ email }],
                    template: {
                        id: Number(process.env.SENDPULSE_TEMPLATE_ID_NEWSLETTER_CONFIRMATION!),
                        variables: {
                            name,
                            year: new Date().getFullYear()
                        },
                    },
                    subject: 'Newsletter FPA'
                },
            );
        });
    }
}