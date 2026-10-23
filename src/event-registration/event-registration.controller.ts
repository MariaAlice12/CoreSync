import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventRegistrationService } from './event-registration.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { UpdateEventRegistrationDto } from './dto/update-event-registration.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('Inscrições em Eventos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event-registration')
export class EventRegistrationController {
  constructor(private readonly service: EventRegistrationService) {}

  @Post()
  @ApiOperation({ summary: 'Criar inscrição em evento' })
  @ApiBody({ type: CreateEventRegistrationDto })
  @ApiResponse({ status: 201, description: 'Inscrição criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Usuário já inscrito' })
  create(
    @Body() dto: CreateEventRegistrationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar inscrições em eventos (participantes)' })
  @ApiQuery({ name: 'eventId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  findAll(@Query('eventId') eventId?: string) {
    return this.service.findAll(eventId ? Number(eventId) : undefined);
  }

  @Get('me')
  @ApiOperation({ summary: 'Inscrições do usuário logado' })
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.findForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar inscrição por ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar inscrição em evento' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEventRegistrationDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventRegistrationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover inscrição em evento' })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.remove(id, user);
  }
}
