import { Body, Controller, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { OrderService } from "./order.service";
import { Role } from "src/common/Decorator/role.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { Request } from "express";
import { CreateOrderDTO } from "./DTO";
import { OrderIdDTO } from "./order.interface";
import { Public } from "src/common/Decorator/public.decorator";

@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller("user/order")
@Role(["user"])
@UseGuards(AuthGuard, RoleGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    async create(
        @Body() createOrderDTO: CreateOrderDTO,
        @Req() req: Request) {
        const order = await this.orderService.createOrder(createOrderDTO, req)

        return {
            message: "Order Created",
            order,
        }
    }

    

    @Post("webhook")
    @Public("public")
    async webhook(@Req() req: Request) {
        return this.orderService.webhook(req)
    }

    @Patch(":orderId")
    async checkOut(@Req() req: Request, @Param() params: OrderIdDTO) {
        const session = await this.orderService.checkOut(req, params.orderId)
        return {
            message: "Order Checked Out",
            session,
        }
    }

    @Patch(":orderId/cancel")
    async cancelOrder(@Req() req: Request, @Param() params: OrderIdDTO) {
        return await this.orderService.cancelOrder(req, params.orderId)
        
    }
}