import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { NotificationService } from './notification.service';

@ApiTags('Notificações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get('me')
  @ApiOperation({ summary: 'Últimas notificações do usuário logado' })
  async findMine(@CurrentUser() user: CurrentUserPayload) {
    const [items, unread] = await Promise.all([
      this.service.findForUser(user.id),
      this.service.countUnread(user.id),
    ]);
    return { items, unread };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  async markAll(@CurrentUser() user: CurrentUserPayload) {
    await this.service.markAllAsRead(user.id);
    return { ok: true };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar uma notificação como lida' })
  @ApiParam({ name: 'id', type: Number })
  markOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.markAsRead(id, user.id);
  }
}
