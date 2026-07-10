import { IsString, MinLength, MaxLength, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateBudgetCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allocatedAmount?: number;
}
