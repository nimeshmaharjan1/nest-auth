import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.databaseService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (user)
      throw new ConflictException('An user with this email already exists.');

    const newUser = await this.databaseService.user.create({
      data: {
        ...createUserDto,
        password: await hash(createUserDto.password, 10),
      },
    });
    return {
      message: 'User has been created.',
      statusCode: 200,
      data: {
        ...newUser,
        password: undefined,
      },
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    return await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
