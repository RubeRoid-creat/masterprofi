import { IsString, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BookSlotDto {
  @ApiProperty()
  @IsString()
  masterId: string;

  @ApiProperty()
  @IsDateString()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  endTime: string;

  @ApiProperty()
  @IsString()
  orderId: string;
}

