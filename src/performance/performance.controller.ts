import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { PerformanceService } from './performance.service';
import { UpsertPerformanceDto } from './dto/upsert-performance.dto';

@ApiTags('Desempenho')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('performance')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  @Put('attendance/:attendanceId')
  @ApiOperation({
    summary:
      'Registrar ou atualizar o desempenho do atleta em uma sessão (professor do treino ou admin)',
  })
  @ApiParam({ name: 'attendanceId', type: Number })
  @ApiBody({ type: UpsertPerformanceDto })
  @ApiResponse({ status: 400, description: 'Sessão futura ou registro vazio' })
  @ApiResponse({ status: 403, description: 'Não é o professor do treino' })
  upsert(
    @Param('attendanceId', ParseIntPipe) attendanceId: number,
    @Body() dto: UpsertPerformanceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.upsert(attendanceId, dto, user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Desempenho registrado do usuário logado' })
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.findForUser(user.id);
  }

  @Get('training/:id')
  @ApiOperation({
    summary: 'Registros de desempenho de um treino (professor ou admin)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  findForTraining(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Query('from') from?: string,
  ) {
    return this.service.findForTraining(id, user, from);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um registro de desempenho' })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.remove(id, user);
  }
}
