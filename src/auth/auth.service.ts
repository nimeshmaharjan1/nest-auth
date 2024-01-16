import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

type UserPayloadType = {
  email: string;
  sub: {
    name: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const payload: UserPayloadType = {
      email: user.email,
      sub: {
        name: user.name,
      },
    };
    return {
      user,
      token: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: '1h',
          secret: process.env.JWT_SECRET_TOKEN,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_TOKEN,
        }),
      },
    };
  }

  async validateUser(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (user && (await compare(dto.password, user.password))) {
      return {
        ...user,
        password: undefined,
      };
    }
    throw new UnauthorizedException();
  }

  async refreshJwtToken(user: UserPayloadType) {
    const payload: UserPayloadType = {
      email: user.email,
      sub: user.sub,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET_TOKEN,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_TOKEN,
      }),
    };
  }
}
