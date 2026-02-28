import "dotenv/config";
import { createHmac, randomBytes } from 'node:crypto';
import { prismaClient } from '../lib/db';
import JWT from 'jsonwebtoken';

const secret = process.env.JWT_SECRET!;

export interface CreateUserPayload {
    firstName: string,
    lastName?: string,
    email: string,
    password: string,
};

export interface GetUserTokenPayload {
    email: string,
    password: string,
};

class UserService {
    private static generateHash (salt: string, password: string) {
        const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');
        return hashedPassword;
    };

    public static createUser(payload: CreateUserPayload) {
        const { firstName, lastName, email, password } = payload;
        const salt = randomBytes(32).toString('hex');
        const hashedPassword = UserService.generateHash(salt, password);
        
        return prismaClient.user.create({
            data: { firstName, email, salt,
                lastName: lastName?? null,
                password: hashedPassword,
            }
        });
    };

    public static getUserById(id: string) {
        return prismaClient.user.findUnique({ where: { id }});
    };

    private static getUserByEmail(email: string) {
        return prismaClient.user.findUnique({ where: { email }});
    };

    public static async getUserToken(payload: GetUserTokenPayload) {
        const { email, password } = payload;
        const user = await UserService.getUserByEmail(email);
        if(!user) throw new Error('User Not Found');

        // match hashed password
        const userSalt = user.salt;
        const userHashedPassword = UserService.generateHash(userSalt, password);
        if(userHashedPassword !== user.password) throw new Error('Incorrect Password');

        // generate token
        const token = JWT.sign({ id: user.id, email: user.email}, secret);
        return token;
    };

    public static decodeJWToken(token: string) {
        return JWT.verify(token, secret);
    };
};

export default UserService;