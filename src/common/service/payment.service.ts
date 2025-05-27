import { Injectable } from "@nestjs/common";
import Stripe from "stripe";


@Injectable()
export class PaymentService {
    private stripe: Stripe;
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    }

    async checkoutSession(
        {
            customer_email,
            mode = "payment",
            cancel_url = process.env.CANCEL_URL,
            success_url = process.env.SUCCESS_URL,
            metadata = {},
            line_items=[],
            discounts = []
        }: Stripe.Checkout.SessionCreateParams
    ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
        const session = await this.stripe.checkout.sessions.create({
            customer_email,
            mode,
            cancel_url,
            success_url,
            metadata,
            line_items,
            discounts
        })
        return session
    }
}