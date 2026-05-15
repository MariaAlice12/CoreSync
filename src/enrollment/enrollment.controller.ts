import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Matrículas')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova matrícula' })
  @ApiBody({ type: CreateEnrollmentDto })
  @ApiResponse({ status: 201, description: 'Matrícula criada com sucesso' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as matrículas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas retornada com sucesso',
  })
  findAll() {
    return this.enrollmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da matrícula' })
  @ApiResponse({ status: 200, description: 'Matrícula encontrada' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma matrícula' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da matrícula' })
  @ApiBody({ type: UpdateEnrollmentDto })
  @ApiResponse({ status: 200, description: 'Matrícula atualizada com sucesso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da matrícula' })
  @ApiResponse({ status: 200, description: 'Matrícula removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.remove(id);
  }
}
