import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingStatus } from './booking-status.enum';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking, BookingDocument } from './schemas/booking.schema';

const ALLOWED_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.CHECKED_IN,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.CHECKED_IN]: [BookingStatus.CHECKED_OUT],
  [BookingStatus.CHECKED_OUT]: [],
  [BookingStatus.CANCELLED]: [],
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async findAll(query: BookingQueryDto) {
    const filter = query.status ? { status: query.status } : {};
    return this.bookingModel.find(filter).sort({ checkIn: -1 }).lean().exec();
  }

  async create(dto: CreateBookingDto) {
    const created = await this.bookingModel.create({
      guestName: dto.guestName.trim(),
      propertyName: dto.propertyName.trim(),
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      status: BookingStatus.PENDING,
      totalAmount: dto.totalAmount,
    });

    return created.toObject();
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid booking id');
    }

    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const from = booking.status;
    const to = dto.status;

    if (from === to) {
      return booking.toObject();
    }

    const allowed = ALLOWED_STATUS_TRANSITIONS[from] ?? [];

    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Cannot change status from "${from}" to "${to}". Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    booking.status = to;
    await booking.save();
    return booking.toObject();
  }
}
