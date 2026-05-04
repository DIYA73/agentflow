import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ─── Register ─────────────────────────────────────────────

export class RegisterDto {
  @ApiProperty({ example: 'Diya' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'diya@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'my-workspace' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  workspaceName: string;
}

// ─── Login ────────────────────────────────────────────────

export class LoginDto {
  @ApiProperty({ example: 'diya@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  password: string;
}

// ─── Refresh ──────────────────────────────────────────────

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
