import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDTO, ProductFilterDTO, ProductIdDTO, UpdateProductDTO } from "./DTO";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/common/Utility/multer";
import { Request } from "express";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { Role } from "src/common/Decorator/role.decorator";
import { CacheInterceptor } from "@nestjs/cache-manager";

@Controller('seller/product')
@Role(["seller"])
@UseGuards(AuthGuard, RoleGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @UseInterceptors(FilesInterceptor('files', 3, multerOptions()))
    async create(
        @Body() createProductDTO: CreateProductDTO,
        @Req() req: Request) {
        const product = await this.productService.create(createProductDTO, req)
        return {
            message: 'Product created successfully',
            product
        }
    }


    @Patch(":productId")
    @UseInterceptors(FilesInterceptor('files', 3, multerOptions()))
    async update(
        @Body() updateProductDTO: UpdateProductDTO,
        @Req() req: Request,
        @Param() params: ProductIdDTO) {
        const product = await this.productService.update(updateProductDTO, req, params.productId)
        return {
            message: 'Product updated successfully',
            product
        }
    }


    @Get()
    async findAll(
        @Query() productFilterDTO: ProductFilterDTO,
        ) {
            
        return await this.productService.findAll(productFilterDTO)
    }
    @UseInterceptors(CacheInterceptor)
    @Get("all")
    async all() {
        const products = await this.productService.all()
        return {
            message: 'Done',
            products
        }
    }

    @UseInterceptors(CacheInterceptor)
    @Get()
    async test () {
        return this.productService.test()
    }
}