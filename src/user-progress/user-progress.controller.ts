import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';

@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post()
  create(@Body() createDto: CreateUserProgressDto) {
    return this.userProgressService.create(createDto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.userProgressService.findByUser(userId);
  }

  @Get(':userId/:stepId')
  findOne(@Param('userId') userId: string, @Param('stepId') stepId: string) {
    return this.userProgressService.findOne(userId, stepId);
  }

  @Patch(':userId/:stepId')
  update(
    @Param('userId') userId: string,
    @Param('stepId') stepId: string,
    @Body() updateDto: UpdateUserProgressDto,
  ) {
    return this.userProgressService.update(userId, stepId, updateDto);
  }
}

