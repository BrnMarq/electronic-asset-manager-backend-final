import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authentication";

export const roleMiddleware = (...allowedRoles: string[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user || !req.user.role) {
			return res.status(401).json({
				message: "No autenticado: Se requiere un token válido.",
			});
		}
		const userRole: string = req.user.role;
		const hasRole = allowedRoles.includes(userRole);

		if (!hasRole) {
			return res.status(403).json({
				message: `Acceso Denegado. Rol '${userRole}' no autorizado para esta acción.`,
			});
		}

		next();
	};
};
