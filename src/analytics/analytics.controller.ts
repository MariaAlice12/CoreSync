import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AnalyticsService, SegmentationFilters } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Get('admin-overview')
  @ApiOperation({
    summary: 'Visão geral de ocupação, evasão e avaliação dos treinos',
  })
  adminOverview() {
    return this.service.adminOverview();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Get('professor-performance')
  @ApiOperation({
    summary:
      'Performance dos treinos de um professor (professor vê a própria; admin informa professorId)',
  })
  @ApiQuery({ name: 'professorId', type: Number, required: false })
  professorPerformance(
    @CurrentUser() user: CurrentUserPayload,
    @Query('professorId') professorId?: string,
  ) {
    return this.service.professorPerformance(
      user,
      professorId ? Number(professorId) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Get('segmentation')
  @ApiOperation({
    summary:
      'BI: matrículas e presenças segmentadas por modalidade, nível, curso, turno e campus',
  })
  @ApiQuery({ name: 'modality', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'course', required: false })
  @ApiQuery({ name: 'shift', required: false })
  @ApiQuery({ name: 'campus', required: false })
  segmentation(@Query() filters: SegmentationFilters) {
    return this.service.segmentation(filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Get('attendance/:trainingId')
  @ApiOperation({ summary: 'Taxa de presença por sessão de um treino' })
  @ApiParam({ name: 'trainingId', type: Number })
  @ApiQuery({ name: 'weeks', required: false, type: Number })
  attendanceRate(
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @CurrentUser() user: CurrentUserPayload,
    @Query('weeks') weeks?: string,
  ) {
    return this.service.attendanceRate(trainingId, user, Number(weeks) || 8);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('athlete/:id')
  @ApiOperation({
    summary:
      'Evolução do atleta: presenças e métricas do Strava ao longo do tempo',
  })
  @ApiParam({ name: 'id', type: Number })
  athletePerformance(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.athletePerformance(id, user);
  }
}
