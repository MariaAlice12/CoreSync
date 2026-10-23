import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Igual ao JwtAuthGuard, mas deixa a requisição passar sem token:
// `request.user` fica undefined quando não há Authorization válido.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
