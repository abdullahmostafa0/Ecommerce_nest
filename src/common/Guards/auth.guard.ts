
import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { UserRepository } from "src/DB/models/User/user.repository";
import { TokenService } from "../service/token.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private tokenService: TokenService,
        private userRepository: UserRepository
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {


        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;
        if (!authorization?.startsWith("Barrer")) {
            throw new UnauthorizedException("In-valid barrer token");
        }
        const token = authorization.split(" ")[1];
        const decoded = this.tokenService.verify(token, { secret: process.env.JWT_SECRET })

        const user = await this.userRepository.findOne({ _id: decoded.id })
        if (!user) {
            throw new NotFoundException("User not found");
        }
        request.user = user;
        return true;
    }

}