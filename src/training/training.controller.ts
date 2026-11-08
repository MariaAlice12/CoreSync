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
import { TrainingService } from './training.service';
import { NIVEIS_TREINO } from './entities/training.entity';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
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

@ApiTags('Treinos')
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Criar novo treino' })
  @ApiBody({ type: CreateTrainingDto })
  @ApiResponse({ status: 201, description: 'Treino criado com sucesso' })
  @ApiResponse({
    status: 409,
    description:
      'Turma repetida, local ocupado ou professor ocupado no horário',
  })
  create(
    @Body() createTrainingDto: CreateTrainingDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trainingService.create(createTrainingDto, user);
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar treinos (filtros por modalidade, nível, professor, campus e status)',
  })
  @ApiQuery({ name: 'modality', required: false })
  @ApiQuery({ name: 'level', required: false, enum: NIVEIS_TREINO })
  @ApiQuery({ name: 'professorId', required: false, type: Number })
  @ApiQuery({ name: 'campus', required: false })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Lista de treinos retornada com sucesso',
  })
  findAll(
    @Query('modality') modality?: string,
    @Query('level') level?: string,
    @Query('professorId') professorId?: string,
    @Query('campus') campus?: string,
    @Query('active') active?: string,
  ) {
    return this.trainingService.findAll({
      modality,
      level,
      campus,
      professorId: professorId ? Number(professorId) : undefined,
      active: active === undefined ? undefined : active === 'true',
    });
  }

  @Get('modalities')
  @ApiOperation({
    summary: 'Modalidades já cadastradas (uma grafia por modalidade)',
  })
  modalities() {
    return this.trainingService.modalities();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um treino por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do treino' })
  @ApiResponse({ status: 200, description: 'Treino encontrado' })
  @ApiResponse({ status: 404, description: 'Treino não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainingService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um treino' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do treino' })
  @ApiBody({ type: UpdateTrainingDto })
  @ApiResponse({ status: 200, description: 'Treino atualizado com sucesso' })
  @ApiResponse({
    status: 409,
    description:
      'Turma repetida, local ocupado ou professor ocupado no horário',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainingDto: UpdateTrainingDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trainingService.update(id, updateTrainingDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um treino' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do treino' })
  @ApiResponse({ status: 200, description: 'Treino removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Treino não encontrado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trainingService.remove(id, user);
  }
}
