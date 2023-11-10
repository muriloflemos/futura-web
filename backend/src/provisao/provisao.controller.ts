import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ProvisaoService } from './provisao.service';
import { Provisao, Usuario } from '@prisma/client';
import { SaveProvisaoDto } from './dto/save-provisao.dto';
import { FindProvisaoDTO } from './dto/find-provisao.dto';
import { GetUser } from '../users/user.decorator';

@Controller('provisao')
export class ProvisaoController {
  constructor(private readonly provisaoService: ProvisaoService) {}

  @Get()
  async findAll(@Query() data: FindProvisaoDTO): Promise<Provisao[]> {
    return await this.provisaoService.find(data);
  }

  @Post()
  async create(
    @GetUser() usuario: Usuario,
    @Body() data: SaveProvisaoDto,
  ): Promise<Provisao> {
    return await this.provisaoService.create(data, usuario.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @GetUser() usuario: Usuario,
    @Body() data: SaveProvisaoDto,
  ): Promise<Provisao> {
    return await this.provisaoService.update(Number(id), data, usuario.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Provisao> {
    return await this.provisaoService.delete(Number(id));
  }
}
