import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['ADMIN', 'STAFF'], required: false })
  @IsOptional()
  @IsIn(['ADMIN', 'STAFF'])
  role?: 'ADMIN' | 'STAFF';
}
