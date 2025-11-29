import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

export function validateObjectId(id: string, fieldName: string = 'ID'): void {
  if (!isValidObjectId(id)) {
    throw new BadRequestException(`Invalid ${fieldName}: ${id}. Must be a valid MongoDB ObjectId.`);
  }
}

export function toObjectId(id: string, fieldName: string = 'ID'): Types.ObjectId {
  validateObjectId(id, fieldName);
  return new Types.ObjectId(id);
}

