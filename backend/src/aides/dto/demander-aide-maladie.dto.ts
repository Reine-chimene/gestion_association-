import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class DemanderAideMaladieDto {
  @IsNotEmpty()
  @IsString()
  beneficiaireId!: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  justificatifs!: string[]; // URLs des documents justificatifs

  @IsOptional()
  @IsString()
  description?: string;
}
