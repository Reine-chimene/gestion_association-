import { IsNotEmpty, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { TypeEpargne } from '@prisma/client';

export class CotiserDto {
  @IsNotEmpty()
  @IsString()
  membreId!: string;

  @IsNotEmpty()
  @IsEnum(TypeEpargne)
  type!: TypeEpargne;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  montant!: number;
}
