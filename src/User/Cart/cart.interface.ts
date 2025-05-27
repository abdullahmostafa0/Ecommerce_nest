import { Types } from "mongoose";

export interface ICartProduct {
    _id?:Types.ObjectId;
    productId:Types.ObjectId;
    quantity:number;
}



export interface ICart {
    _id?:Types.ObjectId;
    createdBy:Types.ObjectId;

    products:ICartProduct[],

    createdAt?:Date;
    updatedAt?:Date;

}