import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SurveyService } from './survey.service';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('Avaliações')
@Controller('survey')
export class SurveyController {
  constructor(private readonly service: SurveyService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Responder pesquisa de avaliação de um treino' })
  @ApiBody({ type: CreateSurveyResponseDto })
  @ApiResponse({ status: 201, description: 'Avaliação registrada com sucesso' })
  create(
    @Body() dto: CreateSurveyResponseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.create(dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações (admin/professor)' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação por ID (admin/professor)' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
