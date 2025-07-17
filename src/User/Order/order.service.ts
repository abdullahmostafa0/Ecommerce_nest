/* eslint-disable no-unsafe-optional-chaining */
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
import { RealtimeGateway } from "src/gateway/gateway";

@Injectable()
export class OrderService {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository,
        private readonly orderRepository: OrderRepository,
        private readonly cartService: CartService,
        private readonly paymentService: PaymentService,
        private readonly realtimeGateway: RealtimeGateway) { }

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
            finalPrice
        })
        await this.cartService.clearCart(req)
        const productStock : {productId: Types.ObjectId | undefined, stock: number | undefined} []= []
        for (const product of products) {
            const items = await this.productRepository.findOneAndUpdate(
                { _id: product.productId },
                {
                    $inc: { stock: -product.quantity }
                })
                productStock.push({
                    productId: items?._id,
                    stock: items?.stock
                })
        }
        this.realtimeGateway.emitStockChanges(productStock)
        
        return { messaga: "Done" }
    }

    async checkOut(req: Request, orderId: Types.ObjectId)
        : Promise<Stripe.Response<Stripe.Checkout.Session>> {

        const order = await this.orderRepository.findOne({
            _id: orderId,
            createdBy: req["user"]._id,
            status: OrderStatus.pending,
            paymentWay: PaymentWay.card
        })

        if (!order) {
            throw new BadRequestException("Order not found")
        }
        const discounts: { coupon: string }[] = [];
        if (order.discountAmount) {
            const coupon = await this.paymentService.createCoupon({
                percent_off: order.discountAmount,
                duration: "once"
            })
            discounts.push({ coupon: coupon.id })
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
            metadata: {
                orderId: orderId as unknown as string
            },
            discounts
        })
        const intent = await this.paymentService.createPaymentIntent(order.finalPrice)

        await this.orderRepository.updateOne(
            { _id: order._id },
            { intentId: intent.id }
        )
        return session
    }

    async cancelOrder(req: Request, orderId: Types.ObjectId) {

        const order = await this.orderRepository.findOne({
            _id: orderId,
            createdBy: req["user"]._id,
            $or: [
                { status: OrderStatus.pending },
                { status: OrderStatus.placed }
            ],
        })
        let refund = {}
        if (
            order?.paymentWay == PaymentWay.card
            || order?.status == OrderStatus.placed
        ) {
            refund = { refundAmount: order.finalPrice, refundDate: Date.now()}
            await this.paymentService.refund(order.intentId)
        }

        for (const product of order?.products as IorderProduct[]) {
            await this.productRepository.updateOne(
                { _id: product.productId },
                { $inc: { stock: product.quantity } }
            )
        }

        await this.orderRepository.updateOne(
            { _id: orderId },
            {
                status: OrderStatus.cancelled,
                ...refund,
                updatedBy: req["user"]._id
            }
        )

        if (!order) {
            throw new BadRequestException("Order not found")
        }

        return { message: "Done" }
    }

    async webhook(req: Request) {
        return this.paymentService.webhook(req)

    }
}