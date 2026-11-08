import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { MailService } from './mail.service';

export interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  /**
   * Mudanças de horário, local ou cancelamento: além do WebSocket, também
   * vão por e-mail (quando há SMTP configurado).
   */
  critical?: boolean;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly gateway: NotificationGateway,
    @Optional() private readonly mail?: MailService,
    @Optional()
    @InjectRepository(User)
    private readonly userRepo?: Repository<User>,
  ) {}

  async notifyUsers(userIds: number[], payload: NotificationPayload) {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) return [];

    const { critical, ...data } = payload;
    const notifications = await this.notificationRepo.save(
      uniqueIds.map((id) =>
        this.notificationRepo.create({
          ...data,
          link: data.link ?? null,
          user: { id } as User,
        }),
      ),
    );

    for (const n of notifications) {
      const { user, ...data } = n;
      this.gateway.emitToUser(user.id, 'notification', data);
    }

    // Fallback por e-mail sem segurar a resposta da requisição.
    if (critical && this.mail?.enabled && this.userRepo) {
      void this.sendEmails(uniqueIds, data).catch((err) =>
        this.logger.warn(`Falha no fallback por e-mail: ${String(err)}`),
      );
    }
    return notifications;
  }

  private async sendEmails(
    userIds: number[],
    payload: Omit<NotificationPayload, 'critical'>,
  ) {
    const users = await this.userRepo!.find({ where: { id: In(userIds) } });
    const frontend = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
      .split(',')[0]
      .replace(/\/$/, '');
    const url = payload.link ? `${frontend}${payload.link}` : frontend;
    return this.mail!.sendMany(
      users
        .filter((u) => u.email)
        .map((u) => ({
          to: u.email,
          subject: `[CoreSync] ${payload.title}`,
          text: `Olá, ${u.name}!\n\n${payload.message}\n\nVeja no CoreSync: ${url}`,
          html: `<p>Olá, ${escapeHtml(u.name)}!</p><p>${escapeHtml(payload.message)}</p><p><a href="${escapeHtml(url)}">Abrir no CoreSync</a></p>`,
        })),
    );
  }

  findForUser(userId: number) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: 50,
    });
  }

  countUnread(userId: number) {
    return this.notificationRepo.count({
      where: { user: { id: userId }, read: false },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!notification) {
      throw new NotFoundException(`Notificação #${id} não encontrada`);
    }
    notification.read = true;
    return this.notificationRepo.save(notification);
  }

  markAllAsRead(userId: number) {
    return this.notificationRepo.update(
      { user: { id: userId }, read: false },
      { read: true },
    );
  }
}
