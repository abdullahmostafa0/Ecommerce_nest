import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Category, IImage } from "../Category/category.model";
import slugify from "slugify";
import { User } from "../User/user.model";

export enum discountTypeEnum {
    FIXED_PRICE="fixedPrice",
    PERCENTAGE="percentage"
}
@Schema({ timestamps: true })
export class Product {

    @Prop({ type: String, required: true, trim: true })
    title: string;
    @Prop({
        type: String,
        default: function () {
            return slugify(this.title)
        },
        trim: true
    })
    slug: string;

    @Prop({ type: String, trim: true })
    description: string;

    @Prop({type: SchemaTypes.ObjectId, ref: User.name, required: true})
    createdBy: Types.ObjectId;

    @Prop({type: SchemaTypes.ObjectId, default: function () {
            return this.createdBy
        
    }})
    updatedBy: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: Category.name })
    category: Types.ObjectId;

    @Prop({ type: Number, required: true, min:1 })
    price: number;

    @Prop({ type: Number, default: 0, min:0, max: 100 })
    discount: number;

    @Prop({type: String, enum: discountTypeEnum, default: discountTypeEnum.PERCENTAGE})
    discountType:discountTypeEnum;

    @Prop({type: Number, default: function () {
        return this.discountType === discountTypeEnum.PERCENTAGE ?
        this.price - (this.price * this.discount) /100 :
        this.price - this.discount
    } })
    finalPrice: number;

    @Prop({ type: Number, default: 1, min:0 })
    stock: number;

    @Prop({ type: [{secure_url: String, public_id: String}] })
    images: IImage[];

    @Prop({type : String})
    folderId: string
}
export const productSchema = SchemaFactory.createForClass(Product);

export type productType = HydratedDocument<Product> & Document;

export const ProductModel = MongooseModule.forFeature([{name: Product.name, schema: productSchema}]);