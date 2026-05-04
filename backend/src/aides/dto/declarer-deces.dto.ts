import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { TypeBeneficiaire } from '@prisma/client';

export class DeclarerDecesDto {
  @IsNotEmpty()
  @IsString()
  membreId!: string; // Membre déclarant le décès

  @IsNotEmpty()
  @IsEnum(TypeBeneficiaire)
  typeBeneficiaire!: TypeBeneficiaire; // MEMBRE, CONJOINT, PARENT, ENFANT

  @IsNotEmpty()
  @IsString()
  nomDefunt!: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  justificatifs!: string[]; // URLs des documents (acte de décès, etc.)

  @IsOptional()
  @IsString()
  description?: string;
}
