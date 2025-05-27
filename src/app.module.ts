
import { Module } from '@nestjs/common';
import { AuthModule } from './Auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './User/user.module';
import { DashboardModule } from './Dachboard/dashboard.module';
import { SellerModule } from './Seller/seller.module';

@Module({
  imports: [
    AuthModule, 
    MongooseModule.forRoot(process.env.DB_URL as string),
    UserModule,
    DashboardModule,
    SellerModule
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
