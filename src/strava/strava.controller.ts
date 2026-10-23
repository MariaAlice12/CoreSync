// src/strava/strava.controller.ts
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { StravaService } from './strava.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StravaActivityDto } from './dto/create-strava.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('Strava')
@Controller('strava')
export class StravaController {
  constructor(private readonly stravaService: StravaService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('connect')
  @ApiOperation({
    summary: 'URL de autorização OAuth do Strava para o usuário logado',
  })
  connect(@CurrentUser() user: CurrentUserPayload) {
    return { url: this.stravaService.getAuthorizeUrl(user.id) };
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Callback OAuth do Strava (redireciona ao frontend)',
  })
  async callback(
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('scope') scope?: string,
    @Query('error') error?: string,
  ) {
    if (error || !code || !state) {
      return res.redirect(
        this.stravaService.frontendUrl('/perfil?strava=denied'),
      );
    }
    try {
      await this.stravaService.handleCallback(code, state, scope);
      return res.redirect(
        this.stravaService.frontendUrl('/perfil?strava=connected'),
      );
    } catch {
      return res.redirect(
        this.stravaService.frontendUrl('/perfil?strava=error'),
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('status')
  @ApiOperation({
    summary: 'Situação da conexão com o Strava do usuário logado',
  })
  status(@CurrentUser() user: CurrentUserPayload) {
    return this.stravaService.status(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('disconnect')
  @ApiOperation({ summary: 'Desconectar a conta do Strava' })
  disconnect(@CurrentUser() user: CurrentUserPayload) {
    return this.stravaService.disconnect(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('sync')
  @ApiOperation({
    summary: 'Sincronizar últimas atividades do Strava do usuário logado',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Quantidade de atividades para sincronizar (padrão 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Atividades sincronizadas',
    type: [StravaActivityDto],
  })
  syncActivities(
    @CurrentUser() user: CurrentUserPayload,
    @Query('perPage') perPage?: string,
  ): Promise<StravaActivityDto[]> {
    return this.stravaService.syncActivities(user.id, Number(perPage) || 30);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Atividades do Strava do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de atividades',
    type: [StravaActivityDto],
  })
  findMine(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<StravaActivityDto[]> {
    return this.stravaService.findForUser(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Get('user/:id')
  @ApiOperation({
    summary: 'Atividades do Strava de um atleta (professor/admin)',
  })
  @ApiParam({ name: 'id', type: Number })
  findForUser(@Param('id', ParseIntPipe) id: number) {
    return this.stravaService.findForUser(id);
  }
}
