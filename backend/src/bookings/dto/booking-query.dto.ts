import { IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '../booking-status.enum';

export class BookingQueryDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
