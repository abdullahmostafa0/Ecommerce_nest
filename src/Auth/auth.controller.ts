
import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { signinDTO, signupDTO } from "./dto";
import { signupSchema, signupType } from "./schemas/schema";
import { ZodValidationPipe } from "src/common/Pipes/zod.validation.pipe";

@UsePipes(ValidationPipe)
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    @Post("signup")
    async signup(@Body() body: signupDTO) { 
        const createdUser = await this.authService.signup(body);
        console.log(createdUser);
        return {message:"User created successfully", data: createdUser};

    }
    
    @Post("signin")
    async signin(@Body() body: signinDTO) {
        const user = await this.authService.signin(body);
        return {message:"User signed in successfully", data: user};
    }


}