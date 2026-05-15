// src/strava/strava.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { StravaService } from './strava.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateStravaDto } from './dto/create-strava.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Strava')
@Controller('strava')
export class StravaController {
  constructor(private readonly stravaService: StravaService) {}

  @Get('sync')
  @ApiOperation({ summary: 'Sincronizar últimas atividades do Strava' })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Quantidade de atividades para sincronizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Atividades sincronizadas',
    type: [CreateStravaDto],
  })
  async syncActivities(
    @Query('perPage') perPage: number,
  ): Promise<CreateStravaDto[]> {
    const activities = await this.stravaService.syncActivities(perPage || 5);

    // ✅ precisa declarar que é array
    return plainToInstance(CreateStravaDto, activities);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as atividades do Strava' })
  @ApiResponse({
    status: 200,
    description: 'Lista de atividades',
    type: [CreateStravaDto],
  })
  async findAll(): Promise<CreateStravaDto[]> {
    const activities = await this.stravaService.findAll();

    // ✅ idem aqui
    return plainToInstance(CreateStravaDto, activities);
  }
}
