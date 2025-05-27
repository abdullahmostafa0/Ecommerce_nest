import { Injectable, NotFoundException } from "@nestjs/common";
import { CloudService } from "src/common/service/cloud.service";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CreateProductDTO, ProductFilterDTO, UpdateProductDTO } from "./DTO";
import { Request } from "express";
import { CategoryService } from "src/Dachboard/Category/category.service";
import { IImage } from "src/DB/models/Category/category.model";
import { FilterQuery, Types } from "mongoose";
import { CategoryRepository } from "src/DB/models/Category/category.repository";
import { discountTypeEnum, productType } from "src/DB/models/Product/product.model"
import { calculateFinalPrice } from "src/common/Utility/finalPrice";
import slugify from "slugify";
import { IPaginate } from "src/DB/db.service";
@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly cloudService: CloudService
    ) { }

    async create(createProductDTO: CreateProductDTO, req: Request) {
        const {
            title,
            description,
            price,
            category,
            discount,
            discountType,
            stock } = createProductDTO;
        const categoryExist = await this.categoryRepository.findOne({ _id: category })
        if (!categoryExist) {
            throw new NotFoundException("Category not found")
        }
        const categoryFolderId = categoryExist.folderId;
        const folderId = Math.ceil(Math.random() * 10000 + 9999).toString()
        let images: IImage[] = []

        if (req.files?.length) {
            images = await this.cloudService.uploadFiles(
                req.files as Express.Multer.File[],
                `${process.env.APP_NAME}/category/${categoryFolderId}/product/${folderId}`)
        }
        const product = await this.productRepository.create({
            title,
            description,
            price,
            category,
            discount,
            discountType,
            stock,
            images,
            folderId,
            createdBy: req["user"]._id as Types.ObjectId,
            updatedBy: req["user"]._id as Types.ObjectId,
        })
        return product;
    }

    async update(updateProductDTO: UpdateProductDTO, req: Request, id: Types.ObjectId) {
        const {
            title,
            description,
            price,
            category,
            discount,
            discountType,
            stock } = updateProductDTO;

        const product = await this.productRepository.findOne({ _id: id })
        if (!product) {
            throw new NotFoundException("Product not found")
        }
        let categoryFolderId: string = ""
        if (updateProductDTO.category) {
            const categoryExist = await this.categoryRepository.findOne({ _id: category })
            if (!categoryExist) {
                throw new NotFoundException("Category not found")
            }
            categoryFolderId = categoryExist.folderId
        }



        let images: IImage[] = []

        if (req.files?.length) {

            images = await this.cloudService.uploadFiles(
                req.files as Express.Multer.File[],
                `${process.env.APP_NAME}/category/${categoryFolderId}/product/${product.folderId}`
            )
        }
        let finalPrice: number = product.finalPrice

        if (price || discount) {
            finalPrice = calculateFinalPrice(
                price || product.price,
                discount || product.discount,
                discountType || product.discountType)

        }
        let slug: string = product.slug
        if (title) {
            slug = slugify(title)
        }
        const productUpdated = await this.productRepository.findOneAndUpdate({ _id: id }, {
            title,
            description,
            price,
            category,
            discount,
            discountType,
            stock,
            images,
            finalPrice,
            slug,
            updatedBy: req["user"]._id as Types.ObjectId,
        })
        if (productUpdated && req.files?.length && product.images.length) {
            const ids = product.images.map((ele) => ele.public_id)
            await this.cloudService.deleteFiles(ids)
        }
        return productUpdated;
    }

    async findAll(query: ProductFilterDTO): Promise<productType[] | [] | IPaginate<productType>>  {

        let filter: FilterQuery<productType> = {}
        if (query.name) {
            filter = {
                $or: [
                    { name: { $regex: `${query.name}`, $options: 'i' } },
                    { slug: { $regex: `${query.name}`, $options: 'i' } }
                ]
            }
        }
        if(query.maxPrice || query.minPrice)
        {
            const max = query.maxPrice ? {$lte: query.maxPrice} : {}
            filter.finalPrice = {
                $gte:query.minPrice || 0, ...max
            }
        }

        const products = await this.productRepository.findAll({
            filter,
            sort:query.sort,
            page:query.page,
            select:query.select,
            population:[{path:"createdBy"}]
        })


        return products;
    }
}