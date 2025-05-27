import { Body, Controller, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { Role } from "src/common/Decorator/role.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { CategoryService } from "./category.service";
import { CategoryFilterDTO, CreateCategoryDTO, UpdateCategorDTO } from "./dto";
import { multerOptions } from "src/common/Utility/multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudInterceptor } from "src/common/Interceptors/cloud.interceptor";
import { Types } from "mongoose";
import { Request } from "express";

@Controller("dashboard/category")
@Role(["admin"])
@UseGuards(AuthGuard, RoleGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }
    @UseInterceptors(FileInterceptor('image', multerOptions()), CloudInterceptor)
    @Post()
    async create(
        @Body() categoryDTO: CreateCategoryDTO,
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File
    ) {

        const category = await this.categoryService.create(
            categoryDTO,
            req["user"],
            file
        );
        return {message:"Done", data:category}
    }

    @Put(":id")
    @UseInterceptors(FileInterceptor('image', multerOptions()))
    async update(
        @Param("id") id: Types.ObjectId,
        @Body() updateCategoryDTO: UpdateCategorDTO,
        @Req() req: Request
    ) {
        const category = await this.categoryService.update(
            id,
            updateCategoryDTO,
            req
        );
        return {
            message: "Done",
            data:category
        }
    }

    @Get()
    async getAll(@Query() query: CategoryFilterDTO) {
        const categories = await this.categoryService.getAll(query);
        return {
            message: "Done",
            data: categories
        }
    }
}