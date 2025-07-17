import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../Decorator/role.decorator";
import { Public } from "../Decorator/public.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const role = this.reflector.get(Role, context.getClass());
        const publicValue = this.reflector.getAllAndMerge(Public,
            [
                context.getClass(),
                context.getHandler()
            ]);
        if (publicValue[0] == 'public') {
            return true;
        }

        const request = this.getRequest(context);
        if (!role.includes(request.user.role)) {
            throw new UnauthorizedException("You are not authorized to access this resource");
        }
        return true

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