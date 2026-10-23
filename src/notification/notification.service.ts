import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';

export interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly gateway: NotificationGateway,
  ) {}

  async notifyUsers(userIds: number[], payload: NotificationPayload) {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) return [];

    const notifications = await this.notificationRepo.save(
      uniqueIds.map((id) =>
        this.notificationRepo.create({
          ...payload,
          link: payload.link ?? null,
          user: { id } as User,
        }),
      ),
    );

    for (const n of notifications) {
      const { user, ...data } = n;
      this.gateway.emitToUser(user.id, 'notification', data);
    }
    return notifications;
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
