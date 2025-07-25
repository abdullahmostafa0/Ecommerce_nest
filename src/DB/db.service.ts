
import { FilterQuery, Model, PopulateOption, PopulateOptions, ProjectionType, QueryOptions, UpdateQuery, UpdateWriteOpResult } from "mongoose";

export interface IPaginate<T> {
    count: number,
    pageSize: number,
    pages: number,
    document: T[]
}

export abstract class DBService<T> {
    constructor(private readonly model: Model<T>) { }

    async create(data: Partial<T>): Promise<T> {
        const created = await this.model.create(data);
        return created;
    }

    async findAll(
        {
            filter,
            select,
            sort,
            page,
            population
        }: {
            filter?: FilterQuery<T>,
            select?: string,
            sort?: string,
            page?: number,
            population?: PopulateOptions[]
        }): Promise<T[] | [] | IPaginate<T>> {

        const query = this.model.find(filter || {});
        if (select) {
            select = select.replaceAll(",", " ")
            query.select(select)
        }

        if (sort) {
            sort = sort.replaceAll(",", " ")
            query.sort(sort)
        }
        if (population) {
            query.populate(population)
        }
        if (!page) {
            return await query.exec()
        }
        const limit = 10
        const skip = (page - 1) * limit;
        const count = await this.model.countDocuments(filter || {})
        const pages = Math.ceil(count / limit)
        const document = await query.skip(skip).limit(limit).exec()
        return {
            count,
            pageSize: limit,
            pages,
            document
        }
    }

    async findOne(
        filter?: FilterQuery<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T>,
        population?: PopulateOptions[]): Promise<T | null> {

        const query = this.model.findOne(filter, projection, options)
        if (population) {
            query?.populate(population)
        }
        return await query?.exec()
    }

    async findOneAndUpdate(
        filter: FilterQuery<T>,
        data: UpdateQuery<T>,
    ): Promise<T | null> {
        return await this.model.findOneAndUpdate(filter, data, { new: true });

    }

    async updateOne(
        filter: FilterQuery<T>,
        data: UpdateQuery<T>,
    ): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(filter, data);
    }

}