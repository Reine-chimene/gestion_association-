import { IsString } from 'class-validator';

export class AnnulerSanctionDto {
  @IsString()
  justification!: string;
}
