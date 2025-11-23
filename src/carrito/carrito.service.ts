import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { Carrito, CarritoDocument } from './schemas/carrito.schema';

@Injectable()
export class CarritoService {
  constructor(
    @InjectModel(Carrito.name) private carritoModel: Model<CarritoDocument>,
  ) {}

  async create(createCarritoDto: CreateCarritoDto): Promise<Carrito> {
    const nuevoCarrito = await this.carritoModel.create(createCarritoDto);
    return nuevoCarrito;
  }

  async findAll(): Promise<Carrito[]> {
    const carritos = await this.carritoModel.find();
    return carritos;
  }

  async findOne(id: string | number): Promise<Carrito> {
    const carrito = await this.carritoModel.findById(id)
    .populate('cliente', 'nombre email');
    if (!carrito) {
      throw new NotFoundException(`Carrito con ID ${id} no encontrado`);
    }
    return carrito;
  }

  async update(id: string | number, updateCarritoDto: UpdateCarritoDto): Promise<Carrito> {
    const carrito = await this.carritoModel.findByIdAndUpdate(id, updateCarritoDto, { new: true })
    .populate('cliente', 'nombre email');
    if (!carrito) {
      throw new NotFoundException(`Carrito con ID ${id} no encontrado`);
    }
    return carrito;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.carritoModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Carrito con ID ${id} no encontrado`);
    }
  }
}
