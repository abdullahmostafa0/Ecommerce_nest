import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, Matches, Max, MaxLength, MinLength } from "class-validator";
import { IOrderInputs, PaymentWay } from "../order.interface";

export class CreateOrderDTO implements IOrderInputs{

    @IsString()
    @MinLength(2)
    @MaxLength(1000)
    address:string;

    @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
    phone:string;


    @IsString()
    @MinLength(2)
    @MaxLength(1000)
    note?: string;

    @IsString()
    @IsEnum(PaymentWay)
    paymentWay: PaymentWay;

    @IsNumber()
    @IsPositive()
    @Max(100)
    @IsOptional()
    discountPercent: number
}