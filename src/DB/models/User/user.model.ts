
import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserRole } from "src/common/enums";

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User {
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: String, required: true, unique: true })
    email: string;
    @Prop({ type: String, required: true })
    password: string;

    @Prop({ type: String, required: false })
    emailOtp: string;

    @Prop({ type: Boolean, required: false , default: false})
    confirmEmail: boolean;

    @Prop({type: String, enum : UserRole, default: UserRole.USER})
    role:string
}
const userSchema = SchemaFactory.createForClass(User)

export const UserModel = MongooseModule.forFeature(
    [{ name: User.name, schema: userSchema }])

export type TypeUser = User & Document
export const connectedUser = new Map()