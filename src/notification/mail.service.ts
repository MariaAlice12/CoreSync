import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Envio de e-mail via SMTP, usado como fallback das notificações críticas
 * (Análise de Riscos: "Risco na Entrega de Notificações"). Sem SMTP_HOST
 * configurado, o serviço fica desligado e não envia nada.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from =
    process.env.SMTP_FROM || 'CoreSync <no-reply@coresync.local>';
  private readonly transporter: Transporter | null = process.env.SMTP_HOST
    ? createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    : null;

  get enabled() {
    return this.transporter !== null;
  }

  /** Envia para cada destinatário; falhas são registradas e não propagam. */
  async sendMany(messages: MailMessage[]): Promise<number> {
    if (!this.transporter) {
      this.logger.debug(
        `SMTP não configurado; ${messages.length} e-mail(s) ignorado(s)`,
      );
      return 0;
    }
    const results = await Promise.allSettled(
      messages.map((m) =>
        this.transporter!.sendMail({ from: this.from, ...m }),
      ),
    );
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.warn(
          `Falha ao enviar e-mail para ${messages[i].to}: ${String(r.reason)}`,
        );
      }
    });
    return results.filter((r) => r.status === 'fulfilled').length;
  }
}
