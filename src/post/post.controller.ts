import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';


@ApiTags('Post') // Agrupa esse controller na UI do Swagger
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  @ApiOperation({ summary: 'Criar novo post' })
  @ApiBody({ type: CreatePostDto, })
  @ApiResponse({ status: 201, description: 'Post criado com sucesso' })
  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os posts' })
  @ApiResponse({ status: 200, description: 'Lista de posts retornada com sucesso' })
  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um post por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do post' })
  @ApiResponse({ status: 200, description: 'Post encontrado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um post' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do post' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um post' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do post' })
  @ApiResponse({ status: 200, description: 'Post removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
