import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";
import { Types } from "mongoose";
import { QueryFilterDto } from "src/common/Dto/query.filter.dto";
import { discountTypeEnum } from "src/DB/models/Product/product.model";

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description: string;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    price: number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    discount: number;

    @IsMongoId()
    @Type(() => Types.ObjectId)
    category: Types.ObjectId;

    @IsString()
    @IsOptional()
    discountType?: discountTypeEnum;

    @Type(()=>Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    stock?: number

}

export class UpdateProductDTO  {
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    price?: number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    discount?: number;

    @IsMongoId()
    @Type(() => Types.ObjectId)
    category?: Types.ObjectId;

    @IsString()
    @IsOptional()
    discountType?: discountTypeEnum;

    @Type(()=>Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    stock?: number
}

export class ProductIdDTO {
    @IsMongoId()
    productId: Types.ObjectId;
}

export class ProductFilterDTO extends QueryFilterDto {

    @IsString()
    @IsOptional()
    @MinLength(1)
    name?:string

    @Type(()=>Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    minPrice?: number

    @Type(()=>Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    maxPrice?: number

    @IsMongoId()
    @IsOptional()
    categoryId?:string


    @Type(()=>Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    stock?: number

}