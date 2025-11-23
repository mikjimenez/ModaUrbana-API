import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { UploadModule } from '../upload/upload.module';
import { Carrito, CarritoSchema } from './schemas/carrito.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Carrito.name, schema: CarritoSchema }]),
    UploadModule,
  ],
  controllers: [CarritoController],
  providers: [CarritoService],
  exports: [CarritoService],
})
export class CarritoModule {}
