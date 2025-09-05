import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { WorksService } from './works.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { QueryWorksDto } from './dto/query-works.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Work } from './entities/work.entity';

@ApiTags('works')
@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 5 },
      { name: 'documents', maxCount: 10 },
    ]),
  )
  @ApiOperation({ summary: 'Registar uma nova obra musical' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Obra registada com sucesso',
    type: Work,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiBearerAuth()
  async create(
    @Body() createWorkDto: CreateWorkDto,
    @Request() req: any,
    @UploadedFiles()
    files?: {
      audio?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ): Promise<Work> {
    if (!files || (!files.audio && !files.documents)) {
      throw new BadRequestException('Pelo menos um ficheiro é obrigatório');
    }

    return this.worksService.create(createWorkDto, req.user.id, files);
  }

  @Get()
  @ApiOperation({ summary: 'Listar obras públicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de obras públicas',
    type: [Work],
  })
  async findAll(@Query() query: QueryWorksDto): Promise<{
    works: Work[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.worksService.findAll(query);
  }

  @Get('my-works')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar obras do utilizador autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de obras do utilizador',
    type: [Work],
  })
  @ApiBearerAuth()
  async findMyWorks(
    @Request() req: any,
    @Query() query: QueryWorksDto,
  ): Promise<{
    works: Work[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.worksService.findByAuthor(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma obra' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da obra',
    type: Work,
  })
  @ApiResponse({
    status: 404,
    description: 'Obra não encontrada',
  })
  async findOne(@Param('id') id: string): Promise<Work> {
    const work = await this.worksService.findOne(id);
    if (!work) {
      throw new NotFoundException('Obra não encontrada');
    }
    return work;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar metadados de uma obra' })
  @ApiResponse({
    status: 200,
    description: 'Obra atualizada com sucesso',
    type: Work,
  })
  @ApiResponse({
    status: 403,
    description: 'Não tem permissão para editar esta obra',
  })
  @ApiResponse({
    status: 404,
    description: 'Obra não encontrada',
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateWorkDto: UpdateWorkDto,
    @Request() req: any,
  ): Promise<Work> {
    return this.worksService.update(id, updateWorkDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remover uma obra (apenas metadados)' })
  @ApiResponse({
    status: 200,
    description: 'Obra removida com sucesso',
  })
  @ApiResponse({
    status: 403,
    description: 'Não tem permissão para remover esta obra',
  })
  @ApiResponse({
    status: 404,
    description: 'Obra não encontrada',
  })
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.worksService.remove(id, req.user.id);
  }

  @Post(':id/sync-blockchain')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sincronizar obra com blockchain' })
  @ApiResponse({
    status: 200,
    description: 'Obra sincronizada com sucesso',
    type: Work,
  })
  @ApiResponse({
    status: 404,
    description: 'Obra não encontrada',
  })
  @ApiBearerAuth()
  async syncWithBlockchain(
    @Param('id') id: string,
    @Body('txHash') txHash: string,
    @Request() req: any,
  ): Promise<Work> {
    return this.worksService.syncWithBlockchain(id, txHash, req.user.id);
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Verificar integridade de uma obra' })
  @ApiResponse({
    status: 200,
    description: 'Resultado da verificação',
  })
  async verifyIntegrity(@Param('id') id: string): Promise<{
    isValid: boolean;
    blockchainHash: string;
    calculatedHash: string;
    registeredAt: Date;
  }> {
    return this.worksService.verifyIntegrity(id);
  }
}
