import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Matrículas') // Agrupa esse controller na UI do Swagger
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  @Post()
  @ApiOperation({ summary: 'Criar nova matrícula' })
  @ApiBody({ type: CreateEnrollmentDto, })
  @ApiResponse({ status: 201, description: 'Matrícula criado com sucesso' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as matrículas' })
  @ApiResponse({ status: 200, description: 'Lista de matrículas retornada com sucesso' })
  findAll() {
    return this.enrollmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da matrícula' })
  @ApiResponse({ status: 200, description: 'Matrícula encontrado' })
  @ApiResponse({ status: 404, description: 'Matricula não encontrado' })
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma matrícula' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da matrícula' })
  @ApiBody({ type: UpdateEnrollmentDto })
  @ApiResponse({ status: 200, description: 'Matrícula atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentService.update(+id, updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da matrícula' })
  @ApiResponse({ status: 200, description: 'Matrícula removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Matricula nao encontrada' })
  remove(@Param('id') id: string) {
    return this.enrollmentService.remove(+id);
  }
}
