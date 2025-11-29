import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePointsDto } from './dto/update-points.dto';
import { UpdateStreakDto } from './dto/update-streak.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'Usuario registrado con éxito',
      user,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'Usuario actualizado',
      user,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      message: 'Usuario eliminado con éxito',
    };
  }

  @Patch(':id/points')
  async updatePoints(
    @Param('id') id: string,
    @Body() updatePointsDto: UpdatePointsDto,
  ) {
    const user = await this.usersService.updatePoints(id, updatePointsDto);
    return {
      message: 'Puntos actualizados',
      user,
    };
  }

  @Patch(':id/streak')
  async updateStreak(
    @Param('id') id: string,
    @Body() updateStreakDto: UpdateStreakDto,
  ) {
    const user = await this.usersService.updateStreak(id, updateStreakDto);
    return {
      message: 'Streak actualizado',
      user,
    };
  }
}

