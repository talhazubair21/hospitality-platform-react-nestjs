import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BookingStatus } from './booking-status.enum';
import { BookingsService } from './bookings.service';
import { Booking } from './schemas/booking.schema';

const VALID_ID = '507f191e810c19729de860ea';

describe('BookingsService', () => {
  let service: BookingsService;
  const mockBookingModel = {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockBookingModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getModelToken(Booking.name),
          useValue: mockBookingModel,
        },
      ],
    }).compile();

    service = moduleRef.get(BookingsService);
  });

  describe('findAll', () => {
    it('filters by status when provided', async () => {
      await service.findAll({ status: BookingStatus.PENDING });

      expect(mockBookingModel.find).toHaveBeenCalledWith({
        status: BookingStatus.PENDING,
      });
    });

    it('uses an empty filter when status is omitted', async () => {
      await service.findAll({});

      expect(mockBookingModel.find).toHaveBeenCalledWith({});
    });
  });

  describe('create', () => {
    it('trims guest and property names and sets pending status', async () => {
      const checkIn = new Date('2026-06-01T14:00:00.000Z');
      const checkOut = new Date('2026-06-05T11:00:00.000Z');
      mockBookingModel.create.mockResolvedValue({
        toObject: () => ({
          _id: new Types.ObjectId(),
          guestName: 'Alex',
          propertyName: 'Lake House',
          checkIn,
          checkOut,
          status: BookingStatus.PENDING,
          totalAmount: 199.5,
        }),
      });

      await service.create({
        guestName: '  Alex  ',
        propertyName: '  Lake House ',
        checkIn,
        checkOut,
        totalAmount: 199.5,
      });

      expect(mockBookingModel.create).toHaveBeenCalledWith({
        guestName: 'Alex',
        propertyName: 'Lake House',
        checkIn,
        checkOut,
        status: BookingStatus.PENDING,
        totalAmount: 199.5,
      });
    });
  });

  describe('updateStatus', () => {
    it('throws BadRequestException for invalid ObjectId', async () => {
      await expect(
        service.updateStatus('not-a-valid-id', {
          status: BookingStatus.CONFIRMED,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockBookingModel.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when booking does not exist', async () => {
      mockBookingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateStatus(VALID_ID, { status: BookingStatus.CONFIRMED }),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns current document when status is unchanged (no-op)', async () => {
      const toObject = jest.fn().mockReturnValue({
        _id: VALID_ID,
        status: BookingStatus.CONFIRMED,
      });
      const doc = {
        status: BookingStatus.CONFIRMED,
        toObject,
        save: jest.fn(),
      };
      mockBookingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await service.updateStatus(VALID_ID, {
        status: BookingStatus.CONFIRMED,
      });

      expect(result).toEqual({
        _id: VALID_ID,
        status: BookingStatus.CONFIRMED,
      });
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('allows a valid transition and persists', async () => {
      const toObject = jest.fn().mockReturnValueOnce({
        _id: VALID_ID,
        status: BookingStatus.CONFIRMED,
      });
      const save = jest.fn().mockResolvedValue(undefined);
      const doc = {
        status: BookingStatus.PENDING,
        toObject,
        save,
      };
      mockBookingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      await service.updateStatus(VALID_ID, {
        status: BookingStatus.CONFIRMED,
      });

      expect(doc.status).toBe(BookingStatus.CONFIRMED);
      expect(save).toHaveBeenCalled();
    });

    it('rejects invalid status transitions', async () => {
      const doc = {
        status: BookingStatus.CHECKED_OUT,
        toObject: jest.fn(),
        save: jest.fn(),
      };
      mockBookingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      await expect(
        service.updateStatus(VALID_ID, { status: BookingStatus.CONFIRMED }),
      ).rejects.toThrow(BadRequestException);
      expect(doc.save).not.toHaveBeenCalled();
    });
  });
});
