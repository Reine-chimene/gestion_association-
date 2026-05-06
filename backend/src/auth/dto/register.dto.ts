import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

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

  // Infos de l'association (optionnelles, pour création automatique)
  @IsOptional()
  @IsString()
  associationNom?: string;

  @IsOptional()
  @IsString()
  associationSlug?: string;

  @IsOptional()
  @IsString()
  associationDevise?: string;

  @IsOptional()
  @IsString()
  associationLangue?: string;
}
