import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CarritoDocument = Carrito & Document;

@Schema({ timestamps: true })
export class Carrito {
  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true,  unique: true  })
  cliente: Types.ObjectId;

  @Prop({ type: [{ producto: { type: Types.ObjectId, ref: 'Producto' }, cantidad: Number }], default: [] })
  items?: any;

  @Prop({ default: 0, min: 0 })
  total?: number;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const CarritoSchema = SchemaFactory.createForClass(Carrito);

CarritoSchema.index({ cliente: 1 });
