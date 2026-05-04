import { IsString, IsEmail, IsOptional, IsDateString, IsUUID, IsNumber, IsIn } from 'class-validator';

export class CreateMembreDto {
  @IsString()
  nom!: string;

  @IsString()
  prenom!: string;

  @IsString()
  telephone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsIn(['CELIBATAIRE', 'MARIE', 'DIVORCE', 'VEUF'])
  situationMatrimoniale?: string;

  @IsOptional()
  @IsNumber()
  nombreEnfants?: number;

  @IsOptional()
  @IsUUID()
  parrainId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
