import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePointsDto } from './dto/update-points.dto';
import { UpdateStreakDto } from './dto/update-streak.dto';
import { validateObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find({}).exec();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      validateObjectId(id, 'User ID');
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, password, name, level } = createUserDto;

      // Validar campos requeridos
      if (!email || !password || !name) {
        throw new BadRequestException(
          'Email, password y name son requeridos',
        );
      }

      // Verificar si el usuario ya existe
      const existingUser = await this.userModel.findOne({ email }).exec();
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      const newUser = new this.userModel({
        email,
        password,
        name,
        level: level || 'A1',
        points: 0,
        streak: 0,
        lastActivity: new Date(),
        createdAt: new Date(),
      });

      return await newUser.save();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      validateObjectId(id, 'User ID');
      const updateData: any = {};

      if (updateUserDto.email) updateData.email = updateUserDto.email;
      if (updateUserDto.password) updateData.password = updateUserDto.password;
      if (updateUserDto.name) updateData.name = updateUserDto.name;
      if (updateUserDto.level) updateData.level = updateUserDto.level;
      if (updateUserDto.points !== undefined)
        updateData.points = updateUserDto.points;
      if (updateUserDto.streak !== undefined)
        updateData.streak = updateUserDto.streak;
      if (updateUserDto.lastActivity)
        updateData.lastActivity = updateUserDto.lastActivity;

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      validateObjectId(id, 'User ID');
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException('Usuario no encontrado');
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  async updatePoints(id: string, updatePointsDto: UpdatePointsDto): Promise<User> {
    try {
      validateObjectId(id, 'User ID');
      const { points } = updatePointsDto;
      const user = await this.userModel
        .findByIdAndUpdate(
          id,
          {
            $inc: { points: points || 0 },
            lastActivity: new Date(),
          },
          { new: true },
        )
        .exec();

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al actualizar puntos:', error);
      throw error;
    }
  }

  async updateStreak(id: string, updateStreakDto: UpdateStreakDto): Promise<User> {
    try {
      validateObjectId(id, 'User ID');
      const { streak } = updateStreakDto;
      const user = await this.userModel
        .findByIdAndUpdate(
          id,
          {
            streak: streak || 0,
            lastActivity: new Date(),
          },
          { new: true },
        )
        .exec();

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al actualizar streak:', error);
      throw error;
    }
  }
}

