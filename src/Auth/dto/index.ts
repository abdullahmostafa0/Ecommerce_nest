
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";


export class signupDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;


    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsStrongPassword()
    @IsNotEmpty()
    confirmPassword: string;
}

export class signinDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;


    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

}

export class confirmDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;


    
    @IsNotEmpty()
    otp: string;

}


