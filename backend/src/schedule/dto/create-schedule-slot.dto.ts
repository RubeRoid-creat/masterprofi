import { IsString, IsDateString, IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { SlotStatus } from "../entities/schedule-slot.entity";

export class CreateScheduleSlotDto {
  @ApiProperty()
  @IsString()
  masterId: string;

  @ApiProperty()
  @IsDateString()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  endTime: string;

  @ApiProperty({ required: false, enum: SlotStatus })
  @IsEnum(SlotStatus)
  @IsOptional()
  status?: SlotStatus;
}

