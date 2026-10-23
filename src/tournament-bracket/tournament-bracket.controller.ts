import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { TournamentBracketService } from './tournament-bracket.service';
import { CreateTournamentBracketDto } from './dto/create-tournament-bracket.dto';
import { UpdateTournamentBracketDto } from './dto/update-tournament-bracket.dto';
import {
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Chaves de Torneios')
@Controller('tournament-bracket')
export class TournamentBracketController {
  constructor(
    private readonly tournamentBracketService: TournamentBracketService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Criar nova chave' })
  @ApiBody({ type: CreateTournamentBracketDto })
  @ApiResponse({ status: 201, description: 'Chave criada com sucesso' })
  create(@Body() createTournamentBracketDto: CreateTournamentBracketDto) {
    return this.tournamentBracketService.create(createTournamentBracketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as chaves' })
  @ApiResponse({
    status: 200,
    description: 'Lista de chaves retornada com sucesso',
  })
  findAll() {
    return this.tournamentBracketService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma chave por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID da chave' })
  @ApiResponse({ status: 200, description: 'Chave encontrada' })
  @ApiResponse({ status: 404, description: 'Chave não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tournamentBracketService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma chave' })
  @ApiParam({ name: 'id', type: String, description: 'UUID da chave' })
  @ApiBody({ type: UpdateTournamentBracketDto })
  @ApiResponse({ status: 200, description: 'Chave atualizada com sucesso' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTournamentBracketDto: UpdateTournamentBracketDto,
  ) {
    return this.tournamentBracketService.update(id, updateTournamentBracketDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'professor')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma chave' })
  @ApiParam({ name: 'id', type: String, description: 'UUID da chave' })
  @ApiResponse({ status: 200, description: 'Chave removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Chave não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tournamentBracketService.remove(id);
  }
}
