import { IsMongoId, IsNumber, IsPositive, Validate } from "class-validator";
import { Types } from "mongoose";
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export class CheckMongoIds implements ValidatorConstraintInterface {
    validate(ids: Types.ObjectId[], args: ValidationArguments) {
        for (const id of ids) {
            if(!Types.ObjectId.isValid){
                return false;
            }
        }
        return true
    }

    defaultMessage(args: ValidationArguments) {
        return 'In-Valid MongoId';
    }
}

export class AddToCartDTO {

    @IsMongoId()
    productId: Types.ObjectId;

    @IsNumber()
    @IsPositive()
    quantity: number;
}

export class ItemIdsDTO {

    @Validate(CheckMongoIds)
    productIds: Types.ObjectId[];
}