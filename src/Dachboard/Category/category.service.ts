/* eslint-disable prefer-const */
import { ConflictException, Injectable, NotFoundException, Type } from "@nestjs/common";
import { CategoryFilterDTO, CreateCategoryDTO, UpdateCategorDTO } from "./dto";
import { CategoryRepository } from "src/DB/models/Category/category.repository";
import { TypeUser } from "src/DB/models/User/user.model";
import { FilterQuery, Types } from "mongoose";
import { typeCategory } from "src/DB/models/Category/category.model";
import { CloudService } from "src/common/service/cloud.service";
import { Request } from "express";
import slugify from "slugify";
import { IPaginate } from "src/DB/db.service";

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly cloudService: CloudService
    ) { }
    async findOne(filter: FilterQuery<typeCategory>) {
        const category = await this.categoryRepository.findOne(filter);
        return category;
    }
    async create(
        createCategoryDTO: CreateCategoryDTO,
        user: TypeUser,
        image: Express.Multer.File)
        : Promise<typeCategory> {

        const { name } = createCategoryDTO;
        const categoryExist = await this.findOne({ name });

        if (categoryExist) {
            throw new ConflictException("category already exist")
        }
        /*
        const folderId = Math.ceil(Math.random() * 10000 + 9999).toString()
        const { secure_url, public_id } = await this.cloudService.uploadFile(
            {
                path: image.path,
                public_id:image.originalname,
                folder: folderId
            })
            */
        const category = {
            name,
            createdBy: user.id as Types.ObjectId,
            image: {
                secure_url: createCategoryDTO.image?.secure_url,
                public_id: createCategoryDTO.image?.public_id
            },
            folderId: createCategoryDTO.image.folderId

        };
        const categoryCreated = await this.categoryRepository.create(category);

        return categoryCreated;
    }

    async update(
        id: Types.ObjectId,
        updateCategoryDTO: UpdateCategorDTO,
        req: Request
    ) {
        const category = await this.categoryRepository.findOne({ _id: id })
        if (!category) {
            throw new NotFoundException("category not found")
        }
        const { name } = updateCategoryDTO
        if (name) {
            const nameExist = await this.findOne({ name })
            if (nameExist) {
                throw new ConflictException("Category name already exist")
            }
            category.name = name
            category.slug = slugify(name)
        }
        const { file } = req
        if (file) {
            const { secure_url } = await this.cloudService.uploadFile(
                {
                    path: file.path,
                    public_id: category.image.public_id,
                }
            )
            category.image.secure_url = secure_url
        }
        return await category.save()

    }

    async getAll(query: CategoryFilterDTO): Promise<typeCategory[] | [] | IPaginate<typeCategory>> {

        let filter: FilterQuery<typeCategory> = {}
        if (query.name) {
            filter = {
                $or: [
                    { name: { $regex: `${query.name}`, $options: 'i' } },
                    { slug: { $regex: `${query.name}`, $options: 'i' } }
                ]
            }
        }
        const categories = await this.categoryRepository.findAll({
            filter,
            sort: query.sort,
            page: query.page,
            select: query.select,
            population: [{ path: "createdBy" }]
        })
        return categories
    }
}