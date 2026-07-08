import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
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
}
