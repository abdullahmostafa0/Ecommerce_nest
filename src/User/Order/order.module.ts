import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { CartModel } from "src/DB/models/Cart/cart.model";
import { OrderModel } from "src/DB/models/Order/order.model";
import { ProductModel } from "src/DB/models/Product/product.model";
import { OrderRepository } from "src/DB/models/Order/order.repository";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CartService } from "../Cart/cart.service";
import { PaymentService } from "src/common/service/payment.service";
import { RealtimeGateway } from "src/gateway/gateway";

@Module({
    imports:[CartModel, ProductModel, OrderModel],
    controllers:[OrderController],
    providers:[
        OrderService,
        CartRepository, 
        OrderRepository, 
        ProductRepository, 
        CartService,
        PaymentService,
        RealtimeGateway],
})
export class OrderModule {}