import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return user;
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
