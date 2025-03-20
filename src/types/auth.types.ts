import { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedUser extends JwtPayload {
  userId: string;
  role: string;
}
