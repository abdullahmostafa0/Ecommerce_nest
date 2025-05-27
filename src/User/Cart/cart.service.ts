import { Injectable, NotFoundException } from "@nestjs/common";
import { AddToCartDTO, ItemIdsDTO } from "./DTO";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { Request } from "express";

@Injectable()
export class CartService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly cartRepository: CartRepository
    ) { }


    async addToCart(addToCartDTO: AddToCartDTO, req: Request) {

        const product = await this.productRepository.findOne(
            {
                _id: addToCartDTO.productId,
                stock: { $gte: addToCartDTO.quantity }
            }
        )
        if (!product) {
            throw new NotFoundException("Product not found or out of stock")
        }

        const cart = await this.cartRepository.findOne({ createdBy: req["user"]._id })

        if (!cart) {
            const newCart = await this.cartRepository.create({
                createdBy: req["user"]._id,
                products: [addToCartDTO]
            })
            return newCart
        }
        let match = false
        for (const [index, product] of cart.products.entries()) {
            if (product.productId.toString() === addToCartDTO.productId.toString()) {
                cart.products[index].quantity = addToCartDTO.quantity
                match = true
                break;
            }
        }
        if (!match) {
            cart.products.push(addToCartDTO)
        }
        await cart.save()
        return { message: "Done" }
    }

    async removeFromCart(itemsId: ItemIdsDTO, req: Request) {

        const cart = await this.cartRepository.updateOne({
            createdBy: req["user"]._id
        },
            {
                $pull: {
                    products: {
                        productId: { $in: itemsId.productIds }
                    }
                }
            }
        )


        return { message: "Done" }
    }

    async clearCart(req: Request) {

        const cart = await this.cartRepository.updateOne({
            createdBy: req["user"]._id
        },
            {
                products: []
            }
        )
        return { message: "Done" }
    }

    async getCart(req: Request) {

        const cart = await this.cartRepository.findOne({
            createdBy: req["user"]._id
        },{},{},            
            [{ path: "products.productId" }]
        )
        return cart
    }
}