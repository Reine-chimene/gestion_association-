import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsEnum(['PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'COMMISSAIRE', 'MEMBRE'])
  @IsNotEmpty()
  role!: 'PRESIDENT' | 'TRESORIER' | 'SECRETAIRE' | 'COMMISSAIRE' | 'MEMBRE';
}
