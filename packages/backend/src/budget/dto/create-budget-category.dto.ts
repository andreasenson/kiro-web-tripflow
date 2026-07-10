import { IsString, MinLength, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateBudgetCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsNumber()
  @Min(0)
  allocatedAmount!: number;
}
