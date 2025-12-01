import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
	user?: {
		id: number;
		role: string;
	};
}

export const authenticatedMiddleware = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader: string =
		req.headers["authorization"] ?? (req.headers["Authorization"] as string);
	const token = authHeader && authHeader.split(" ")[1];

	if (token == null) {
		return res.sendStatus(401);
	}

	jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
		if (err) {
			return res.sendStatus(403);
		}
        
        const roleName = (user.role && typeof user.role === 'object') ? user.role.name : user.role;
		req.user = { id: user.id, role: roleName };
		next();
	});
};