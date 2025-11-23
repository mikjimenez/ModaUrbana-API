import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CarritoService } from './carrito.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Carrito')
@ApiBearerAuth('JWT-auth')
@Controller('carrito')
export class CarritoController {
  constructor(
    private readonly carritoService: CarritoService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Carrito' })
  @ApiBody({ type: CreateCarritoDto })
  @ApiResponse({ status: 201, description: 'Carrito creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createCarritoDto: CreateCarritoDto) {
    const data = await this.carritoService.create(createCarritoDto);
    return {
      success: true,
      message: 'Carrito creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Carrito' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Carrito' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagen subida exitosamente' })
  @ApiResponse({ status: 404, description: 'Carrito no encontrado' })
  async uploadImage(
    @Param('id') id: string,
    @Req() request: FastifyRequest,
  ) {
    // Obtener archivo de Fastify
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!data.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    const buffer = await data.toBuffer();
    const file = {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
    } as Express.Multer.File;

    const uploadResult = await this.uploadService.uploadImage(file);
    const updated = await this.carritoService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { carrito: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Carritos' })
  @ApiResponse({ status: 200, description: 'Lista de Carritos' })
  async findAll() {
    const data = await this.carritoService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Carrito por ID' })
  @ApiParam({ name: 'id', description: 'ID del Carrito' })
  @ApiResponse({ status: 200, description: 'Carrito encontrado' })
  @ApiResponse({ status: 404, description: 'Carrito no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.carritoService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Carrito' })
  @ApiParam({ name: 'id', description: 'ID del Carrito' })
  @ApiBody({ type: UpdateCarritoDto })
  @ApiResponse({ status: 200, description: 'Carrito actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Carrito no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateCarritoDto: UpdateCarritoDto
  ) {
    const data = await this.carritoService.update(id, updateCarritoDto);
    return {
      success: true,
      message: 'Carrito actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Carrito' })
  @ApiParam({ name: 'id', description: 'ID del Carrito' })
  @ApiResponse({ status: 200, description: 'Carrito eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Carrito no encontrado' })
  async remove(@Param('id') id: string) {
    const carrito = await this.carritoService.findOne(id);
    if (carrito.imagen) {
      const filename = carrito.imagen.split('/').pop();
      if (filename) {
      await this.uploadService.deleteImage(filename);
      }
    }
    await this.carritoService.remove(id);
    return { success: true, message: 'Carrito eliminado exitosamente' };
  }
}
