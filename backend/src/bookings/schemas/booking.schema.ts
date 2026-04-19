import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BookingStatus } from '../booking-status.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking {
  @Prop({ required: true, trim: true })
  guestName: string;

  @Prop({ required: true, trim: true })
  propertyName: string;

  @Prop({ required: true, type: Date })
  checkIn: Date;

  @Prop({ required: true, type: Date })
  checkOut: Date;

  @Prop({
    required: true,
    type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  /** Set automatically by Mongoose when `timestamps: true` (document creation time). */
  @Prop({ type: Date })
  createdAt: Date;

  /** Set automatically by Mongoose when `timestamps: true` (last update time). */
  @Prop({ type: Date })
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ status: 1, createdAt: -1 });
