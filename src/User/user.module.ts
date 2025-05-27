import { Module } from "@nestjs/common";
import { CartModule } from "./Cart/cart.module";
import { OrderModule } from "./Order/order.module";

@Module({
    imports: [CartModule, OrderModule],
    controllers: [],
    providers: []
})
export class UserModule {}