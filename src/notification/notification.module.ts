import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { MailService } from './mail.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User]), AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway, MailService],
  exports: [NotificationService, MailService],
})
export class NotificationModule {}
