import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PHOTOS_PER_UPLOAD = 10;

@ApiTags('Eventos')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Criar novo evento (admin/professor)' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso' })
  create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventService.create(createEventDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os eventos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos retornada com sucesso',
  })
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um evento por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento encontrado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um evento (criador, organizador ou admin)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID do evento' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ status: 200, description: 'Evento atualizado com sucesso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventService.update(id, updateEventDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: 'Remover um evento (criador, organizador ou admin)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventService.remove(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/photos')
  @ApiOperation({ summary: 'Listar fotos do repositório do evento' })
  @ApiParam({ name: 'id', type: Number })
  listPhotos(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.listPhotos(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/photos')
  @ApiOperation({
    summary:
      'Enviar fotos ao repositório do evento (participantes e organizadores)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photos: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('photos', MAX_PHOTOS_PER_UPLOAD, {
      limits: { fileSize: MAX_PHOTO_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Apenas imagens são permitidas'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadPhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!files?.length) {
      throw new BadRequestException(
        'Envie ao menos uma imagem no campo "photos"',
      );
    }
    return this.eventService.addPhotos(id, files, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/photos/:photoId')
  @ApiOperation({ summary: 'Remover uma foto do evento' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'photoId', type: Number })
  removePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventService.removePhoto(id, photoId, user);
  }
}
