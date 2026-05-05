import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateEmployeeDTO {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsOptional()
  personalEmail?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  contractType?: string;

  @IsString()
  @IsOptional()
  workLocation?: string;

  @IsString()
  @IsOptional()
  salaryGrade?: string;

  @IsString()
  @IsOptional()
  probationEndDate?: string;

  @IsString()
  @IsOptional()
  hrNotes?: string;

  @IsString()
  @IsOptional()
  emergencyName?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsString()
  @IsOptional()
  emergencyRelation?: string;

  @IsString()
  @IsOptional()
  joinDate?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  jobTitleId?: string;
}
