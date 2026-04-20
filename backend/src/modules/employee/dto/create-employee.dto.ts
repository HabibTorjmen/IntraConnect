import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmployeeDTO {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  joinDate?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  jobTitleId?: string;
}