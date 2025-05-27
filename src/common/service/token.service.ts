import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    sign(payload: object, options: JwtSignOptions) {
        console.log(payload, options)
        return this.jwtService.sign(
            payload,
            options
        )
    }
    verify(token: string, options: JwtSignOptions) {
        return this.jwtService.verify(token, options)
    }
}