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
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
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

@ApiTags('Matrículas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova matrícula' })
  @ApiBody({ type: CreateEnrollmentDto })
  @ApiResponse({ status: 201, description: 'Matrícula criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Já matriculado ou treino lotado' })
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentService.create(createEnrollmentDto, user);
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar matrículas (aluno vê só as suas; filtros por treino, curso, turno e status)',
  })
  @ApiQuery({ name: 'trainingId', required: false, type: Number })
  @ApiQuery({ name: 'course', required: false })
  @ApiQuery({ name: 'shift', required: false })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas retornada com sucesso',
  })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('trainingId') trainingId?: string,
    @Query('course') course?: string,
    @Query('shift') shift?: string,
    @Query('active') active?: string,
  ) {
    return this.enrollmentService.findAll(user, {
      trainingId: trainingId ? Number(trainingId) : undefined,
      course,
      shift,
      active: active === undefined ? undefined : active === 'true',
    });
  }

  @Get('me')
  @ApiOperation({ summary: 'Matrículas do usuário logado' })
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.enrollmentService.findForUser(user.id);
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
  @ApiOperation({ summary: 'Ativar/cancelar uma matrícula' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da matrícula' })
  @ApiBody({ type: UpdateEnrollmentDto })
  @ApiResponse({ status: 200, description: 'Matrícula atualizada com sucesso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentService.update(id, updateEnrollmentDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da matrícula' })
  @ApiResponse({ status: 200, description: 'Matrícula removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentService.remove(id, user);
  }
}
