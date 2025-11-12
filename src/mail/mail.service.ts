// src/mail/mail.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as sendpulse from 'sendpulse-api'
import { PrismaService } from 'src/prisma/prisma.service';
import { chunk } from 'lodash';
const BATCH_SIZE = 100;

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
                    this.logger.log(`senderEmail: ${this.senderEmail}, senderName: ${this.senderName}`);
                } else {
                    this.logger.error('SendPulse authentication failed');
                }
            }
        );
    }

    async sendPasswordResetCode(to: string, code: string) {
        const url = `https://agenciafpa.com.br/primeiro-acesso?email=${encodeURIComponent(to)}&code=${code}`;

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
        const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light only" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Convite</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin:0; padding:0; background:#f7f7f8; }
    .wrapper { width:100%; padding:24px 0; }
    .container { max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.06); }
    .header { padding:20px 28px; background:#1C9658; color:#fff; font-weight:700; font-size:18px; }
    .content { padding:28px; color:#222; }
    .p { margin:0 0 16px; line-height:1.55; }
    .btn { display:inline-block; background:#1C9658; color:#fff !important; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600; }
    .url { word-break: break-all; color:#1C9658; }
    .footer { padding:16px 28px; color:#6b7280; font-size:12px; text-align:center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">Convite para participar do sistema</div>
      <div class="content">
        <p class="p">Olá,</p>
        <p class="p">Você recebeu um convite para acessar nossa plataforma. Clique no botão abaixo para aceitar:</p>
        <p class="p">
          <a class="btn" href="${url}" target="_blank" rel="noopener noreferrer">Aceitar convite</a>
        </p>
        <p class="p">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
        <p class="p url">${url}</p>
        <p class="p">Se você não esperava este convite, pode ignorar este e-mail.</p>
      </div>
      <div class="footer">© ${new Date().getFullYear()} — Equipe</div>
    </div>
  </div>
</body>
</html>`;

        const emailData = {
            html,
            text: `Você foi convidado a participar do sistema. Acesse: ${url}`, // fallback
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

    async sendNewsletterEmail(templateId: number, subject: string) {
        const usersSubscribed = await this.prisma.newsletterSubscription.findMany();

        if (usersSubscribed.length === 0) {
            this.logger.warn('Nenhum usuário inscrito na newsletter.');
            return;
        }

        const recipients = usersSubscribed.map((user) => ({
            email: user.email,
        }));

        const batches = chunk(recipients, BATCH_SIZE);


        for (const [index, batch] of batches.entries()) {
            await new Promise<void>((resolve, reject) => {
                sendpulse.smtpSendMail(
                    (response: any) => {
                        if (response?.result) {
                            this.logger.log(`Lote ${index + 1}/${batches.length} enviado com sucesso.`);
                            resolve();
                        } else {
                            this.logger.error(`Erro no envio do lote ${index + 1}`, response);
                            reject(response);
                        }
                    },
                    {
                        from: {
                            name: this.senderName,
                            email: this.senderEmail,
                        },
                        to: batch,
                        template: {
                            id: templateId,
                        },
                        subject,
                    }
                );
            });

            // 🔁 Opcional: delay entre os lotes (ex: 1 segundo)
            await new Promise((res) => setTimeout(res, 1000));
        }

        this.logger.log(`Todos os ${batches.length} lotes enviados com sucesso.`);
    }

    async sendPasswordReset(to: string, loginUrl: string, newPassword: string) {
        const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light only" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Nova senha temporária</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin:0; padding:0; background:#f7f7f8; }
    .wrapper { width:100%; padding:24px 0; }
    .container { max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.06); }
    .header { padding:20px 28px; background:#1C9658; color:#fff; font-weight:700; font-size:18px; }
    .content { padding:28px; color:#222; }
    .p { margin:0 0 16px; line-height:1.55; }
    .btn { display:inline-block; background:#1C9658; color:#fff !important; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600; }
    .url { word-break: break-all; color:#1C9658; }
    .box { background:#f3f4f6; border:1px solid #e5e7eb; padding:12px 14px; border-radius:8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .muted { color:#6b7280; font-size:12px; }
    .footer { padding:16px 28px; color:#6b7280; font-size:12px; text-align:center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">Sua nova senha temporária</div>
      <div class="content">
        <p class="p">Olá,</p>
        <p class="p">Geramos uma <strong>nova senha temporária</strong> para sua conta. Use-a para fazer login e, em seguida, altere sua senha nas configurações da conta.</p>

        <p class="p"><strong>Senha temporária:</strong></p>
        <p class="box">${newPassword}</p>

        <p class="p">
          <a class="btn" href="${loginUrl}" target="_blank" rel="noopener noreferrer">Acessar login</a>
        </p>

        <p class="p">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
        <p class="p url">${loginUrl}</p>

        <p class="p muted">Por segurança, recomendamos alterar sua senha após o primeiro acesso.</p>
      </div>
      <div class="footer">© ${new Date().getFullYear()} — Equipe</div>
    </div>
  </div>
</body>
</html>`;

        const emailData = {
            html,
            text: `Foi gerada uma nova senha temporária para sua conta.\n\nSenha temporária: ${newPassword}\n\nAcesse o login: ${loginUrl}\n\nRecomendamos alterar a senha após o primeiro acesso.`,
            to: [{ email: to }],
            from: {
                name: this.senderName,
                email: this.senderEmail,
            },
            subject: 'Sua nova senha temporária',
        };

        return new Promise<void>((resolve, reject) => {
            sendpulse.smtpSendMail(
                (response: any) => {
                    if (response?.result) {
                        this.logger.log(`Nova senha temporária enviada para ${to}`);
                        resolve();
                    } else {
                        this.logger.error(`Erro ao enviar nova senha temporária para ${to}`, response);
                        reject(response);
                    }
                },
                emailData,
            );
        });
    }
}