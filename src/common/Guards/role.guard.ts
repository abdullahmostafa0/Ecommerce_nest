import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../Decorator/role.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean {
        const role = this.reflector.get(Role, context.getClass());
        const request = context.switchToHttp().getRequest();
        if(!role.includes(request.user.role))
        {
            throw new UnauthorizedException("You are not authorized to access this resource");
        }
        return true

    }
}