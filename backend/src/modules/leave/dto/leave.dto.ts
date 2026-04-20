import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateLeaveDTO {
  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-05-05' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'annual' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'Vacation' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: 'employee-id-uuid' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;
}

export class UpdateLeaveStatusDTO {
  @ApiProperty({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;
}
