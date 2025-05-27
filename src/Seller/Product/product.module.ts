import { Module } from "@nestjs/common";
import { ProductModel } from "src/DB/models/Product/product.model";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CategoryRepository } from "src/DB/models/Category/category.repository";
import { CategoryService } from "src/Dachboard/Category/category.service";
import { CategoryModel } from "src/DB/models/Category/category.model";
import { CloudService } from "src/common/service/cloud.service";

@Module({
    imports: [ProductModel, CategoryModel],
    controllers: [ProductController],
    providers: [
        ProductService,
        ProductRepository,
        CategoryRepository,
        CategoryService,
        CloudService
    ]
})
export class ProductModule { }