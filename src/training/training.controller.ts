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
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  create(@Body() createTrainingDto: CreateTrainingDto) {
    return this.trainingService.create(createTrainingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os treinos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de treinos retornada com sucesso',
  })
  findAll() {
    return this.trainingService.findAll();
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ) {
    return this.trainingService.update(id, updateTrainingDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um treino' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do treino' })
  @ApiResponse({ status: 200, description: 'Treino removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Treino não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trainingService.remove(id);
  }
}
