import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'checkOutAfterCheckIn', async: false })
class CheckOutAfterCheckInConstraint implements ValidatorConstraintInterface {
  validate(checkOut: unknown, args: ValidationArguments): boolean {
    const obj = args.object as { checkIn?: unknown };
    const checkIn = obj.checkIn;
    if (!(checkIn instanceof Date) || !(checkOut instanceof Date)) {
      return true;
    }
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return false;
    }
    return checkOut.getTime() > checkIn.getTime();
  }

  defaultMessage(): string {
    return 'Check-out must be after check-in';
  }
}

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsString()
  @IsNotEmpty()
  propertyName: string;

  @Type(() => Date)
  @IsDate()
  checkIn: Date;

  @Type(() => Date)
  @IsDate()
  @Validate(CheckOutAfterCheckInConstraint)
  checkOut: Date;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;
}
