import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';


@ApiTags('Eventos') // Agrupa esse controller na UI do Swagger
@Controller('event')
export class EventController { 
  constructor(private readonly eventService: EventService) { }

  @Post()
  @ApiOperation({ summary: 'Criar novo evento' })
  @ApiBody({ type: CreateEventDto, })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os eventos' })
  @ApiResponse({ status: 200, description: 'Lista de eventos retornada com sucesso' })
  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um evento por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento encontrado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um evento' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do evento' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ status: 200, description: 'Evento atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um evento' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }
}
