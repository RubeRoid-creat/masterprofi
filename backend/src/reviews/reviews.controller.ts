import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@ApiTags("reviews")
@Controller("reviews")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: "Create a review" })
  @ApiResponse({ status: 201, description: "Review created" })
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    const clientId = req.user?.id;
    return this.reviewsService.create(createReviewDto, clientId);
  }

  @Get()
  @ApiOperation({ summary: "Get all reviews" })
  @ApiResponse({ status: 200, description: "Returns all reviews" })
  async findAll(@Query("masterId") masterId?: string, @Query("orderId") orderId?: string) {
    return this.reviewsService.findAll(masterId, orderId);
  }

  @Get("master/:masterId/stats")
  @ApiOperation({ summary: "Get master review statistics" })
  @ApiResponse({ status: 200, description: "Returns master stats" })
  async getMasterStats(@Param("masterId") masterId: string) {
    return this.reviewsService.getMasterStats(masterId);
  }

  @Get("overall/stats")
  @ApiOperation({ summary: "Get overall review statistics" })
  @ApiResponse({ status: 200, description: "Returns overall stats" })
  async getOverallStats() {
    return this.reviewsService.getOverallStats();
  }

  @Get("order/:orderId")
  @ApiOperation({ summary: "Get review by order ID" })
  @ApiResponse({ status: 200, description: "Returns review" })
  async findByOrder(@Param("orderId") orderId: string) {
    return this.reviewsService.findByOrder(orderId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get review by ID" })
  @ApiResponse({ status: 200, description: "Returns review" })
  async findOne(@Param("id") id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update review" })
  @ApiResponse({ status: 200, description: "Review updated" })
  async update(@Param("id") id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete review" })
  @ApiResponse({ status: 200, description: "Review deleted" })
  async remove(@Param("id") id: string) {
    await this.reviewsService.remove(id);
    return { message: "Отзыв удален" };
  }
}

