/*  */
/*  */
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { CreateOrderDTO } from "./DTO";
import { Request } from "express";
import { IorderProduct, OrderStatus, PaymentWay } from "./order.interface";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { Matches } from "class-validator";
import { OrderRepository } from "src/DB/models/Order/order.repository";
import { CartService } from "../Cart/cart.service";
import { Types } from "mongoose";
import { PaymentService } from "src/common/service/payment.service";
import Stripe from "stripe";

@Injectable()
export class OrderService {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository,
        private readonly orderRepository: OrderRepository,
        private readonly cartService: CartService,
        private readonly paymentService: PaymentService) { }

    async createOrder(createOrderDTO: CreateOrderDTO, req: Request) {
        const cart = await this.cartRepository.findOne({ createdBy: req["user"]._id })
        if (!cart?.products?.length) {
            return new NotFoundException("Cart Empty")
        }
        let subTotal: number = 0
        const products: IorderProduct[] = []

        for (const product of cart.products) {
            const checkProduct = await this.productRepository.findOne(
                {
                    _id: product.productId,
                    stock: { $gte: product.quantity }
                }
            )
            if (!checkProduct) {
                throw new BadRequestException("In-Valid Product or out of stock" + product.productId)
            }
            products.push({
                name: checkProduct.title,
                productId: checkProduct._id,
                quantity: product.quantity,
                unitPrice: checkProduct.finalPrice,
                finalPrice: checkProduct.finalPrice * product.quantity
            })
            subTotal += checkProduct.finalPrice * product.quantity
        }
        let finalPrice = subTotal
        if (createOrderDTO.discountPercent) {
            finalPrice = Math.floor(
                subTotal - (createOrderDTO.discountPercent / 100) * subTotal
            )
        }

        const order = await this.orderRepository.create({
            ...createOrderDTO,
            subTotal,
            discountAmount: createOrderDTO.discountPercent,
            products,
            createdBy: req["user"]._id,
        })
        await this.cartService.clearCart(req)

        for (const product of products) {
            await this.productRepository.updateOne(
                { _id: product.productId },
                {
                    $inc: { stock: -product.quantity }
                })

        }
        return { messaga: "Done" }
    }

    async checkOut(req: Request, orderId: Types.ObjectId)
    :Promise<Stripe.Response<Stripe.Checkout.Session>> {

        const order = await this.orderRepository.findOne({
            _id: orderId,
            createdBy: req["user"]._id,
            status: OrderStatus.pending,
            paymentWay: PaymentWay.card
        })

        if (!order) {
            throw new BadRequestException("Order not found")
        }

        const session = await this.paymentService.checkoutSession({
            customer_email: req["user"].email,
            line_items: order.products.map((product) => {
                return {
                    quantity: product.quantity,
                    price_data: {
                        product_data: {
                            name: product.name,
                        },
                    currency: "egp",
                    unit_amount: product.unitPrice * 100
                    },
                    
                }
            }),
            metadata:{
                orderId: orderId as unknown as string
            }
        })
        
        return session
    }
}