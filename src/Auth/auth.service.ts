
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { signinDTO, signupDTO } from "./dto";
import { UserRepository } from "src/DB/models/User/user.repository";
import { compare, hash } from "src/common/security/password.security";
import { TypeUser } from "src/DB/models/User/user.model";
import { sendEmail } from "src/common/Utility/sendEmail";
import { TokenService } from "src/common/service/token.service";

@Injectable()
export class AuthService {
    constructor(private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
    ) { }

    async signup(body: signupDTO): Promise<TypeUser> {
        const { name, email, password } = body
        const userExist = await this.userRepository.findByEmail(email)
        if (userExist) {
            throw new ConflictException('User already exist')
        }
        const user = await this.userRepository.create(
            { name, email, password: hash(password) })
        const code = Math.floor(1000 + Math.random() * 900000);

        await sendEmail({ to: email, subject: 'Confirm Email', html: `<h1>Welcome to Ecommerce, please confirm your code : ${code}</h1>` })

        return user

    }

    async signin(body: signinDTO): Promise<string> {
        
        const {email, password} = body
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new NotFoundException('User not found')
        }
        if (!compare(password, user.password)) {
            throw new ConflictException('Password is not correct')
        }
        
        const token = this.tokenService.sign({id: user.id}, {secret: process.env.JWT_SECRET, expiresIn: '1h'})
        console.log(token)
        return token

    }
}