import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const corsOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

// Cada usuário autenticado entra na sala `user:<id>`; o NotificationService
// emite nessa sala sempre que cria uma notificação para ele.
@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: corsOrigins, credentials: true },
})
export class NotificationGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const raw =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers.authorization as string | undefined);
    const token = raw?.replace(/^Bearer\s+/i, '');

    try {
      const payload = this.jwtService.verify<{ sub: number }>(token ?? '');
      client.join(`user:${payload.sub}`);
    } catch {
      this.logger.debug(`Conexão recusada sem JWT válido (${client.id})`);
      client.disconnect(true);
    }
  }

  emitToUser(userId: number, event: string, data: unknown) {
    this.server?.to(`user:${userId}`).emit(event, data);
  }
}
