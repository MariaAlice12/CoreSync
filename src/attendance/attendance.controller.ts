import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@ApiTags('Presenças')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Confirmar presença em um dia de treino' })
  @ApiBody({ type: CreateAttendanceDto })
  @ApiResponse({ status: 201, description: 'Presença confirmada' })
  @ApiResponse({
    status: 400,
    description: 'Data passada ou fora dos dias do treino',
  })
  @ApiResponse({ status: 403, description: 'Atleta não matriculado no treino' })
  @ApiResponse({ status: 409, description: 'Presença já confirmada' })
  create(
    @Body() dto: CreateAttendanceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.create(dto, user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Presenças confirmadas pelo usuário logado' })
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.findForUser(user.id);
  }

  @Get('training/:id')
  @ApiOperation({
    summary:
      'Sessões do treino com os atletas confirmados (professor, admin e matriculados)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  sessions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Query('date') date?: string,
    @Query('from') from?: string,
  ) {
    return this.service.sessionsForTraining(id, user, { date, from });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar uma presença confirmada' })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.remove(id, user);
  }
}
