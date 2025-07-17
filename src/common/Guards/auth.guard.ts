
import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { UserRepository } from "src/DB/models/User/user.repository";
import { TokenService } from "../service/token.service";
import { Reflector } from "@nestjs/core";
import { Public } from "../Decorator/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private tokenService: TokenService,
        private userRepository: UserRepository,
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = this.getRequest(context);
        const authorization = this.getAuthorization(context)
        console.log(authorization)
        const publicValue = this.reflector.getAllAndMerge(Public, 
            [
                context.getHandler(),
                context.getClass()
            ]
        )
        if(publicValue[0] == 'public') {
            return true
        }
        
        if (!authorization?.startsWith("Barrer")) {
            throw new UnauthorizedException("In-valid barrer token");
        }
        const token = authorization.split(" ")[1];
        let decoded : any
        try {
            decoded = await this.tokenService.verify(token, { secret: process.env.JWT_SECRET })

        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token')
        }

        const user = await this.userRepository.findOne({ _id: decoded.id })
        if (!user) {
            throw new NotFoundException("User not found");
        }
        request.user = user;
        return true;
    }
    private getAuthorization(context: ExecutionContext) {
        switch(context['contextType']) {
            case 'http' :
                return context.switchToHttp().getRequest().headers.authorization
            case 'ws' : 
                return context.switchToWs().getClient().handshake?.headers?.authorization ||
                context.switchToWs().getClient().handshake?.auth?.authorization
                
        }
    }

    private getRequest(context: ExecutionContext) {
        switch(context['contextType']) {
            case 'http' :
                return context.switchToHttp().getRequest()
            case 'ws' : 
                return context.switchToWs().getClient()
        }
    }

}