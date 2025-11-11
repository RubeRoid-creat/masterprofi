import { PartialType } from "@nestjs/swagger";
import { ApiProperty } from "@nestjs/swagger";
import { CreateReviewDto } from "./create-review.dto";

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiProperty({ required: false })
  isPublished?: boolean;
}

