import { IsString, IsOptional } from 'class-validator';

export class UpdateEmployeeDTO {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  joinDate?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  jobTitleId?: string;
}