import Controller from '../interfaces/controller';
import {Request, Response, NextFunction, Router} from 'express';
import {auth} from '../middlewares/auth.middleware';
import {admin} from '../middlewares/admin.middleware';
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";
import {authorizeRoles} from "../middlewares/role.middleware";

class UserController implements Controller {
    public path = '/api/user';
    public router = Router();
    private userService = new UserService();
    private passwordService = new PasswordService();
    private tokenService = new TokenService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/all` ,  authorizeRoles('admin'), this.getAllUsers);
        this.router.post(`${this.path}/create`, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, this.authenticate);
        this.router.post(`${this.path}/reset/:name`, this.updatePassword);
        this.router.delete(`${this.path}/clean-expired`, authorizeRoles('admin'), this.cleanExpiredTokens);
        this.router.delete(`${this.path}/logout/:userId`,auth, this.removeHashSession);

    }

    private getAllUsers = async (request: Request, response: Response, next: NextFunction) => {
        const users = await this.userService.getAllUsers();
        response.status(200).json(users);
    };

    private authenticate = async (request: Request, response: Response, next: NextFunction) => {
        const { login, password } = request.body;

        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                return response.status(401).json({ error: 'Unauthorized' });
            }
            const isAuthorized = await this.passwordService.authorize(user._id, password);
            if (!isAuthorized) {
                return response.status(401).json({ error: 'Unauthorized' });
            }
            const token = await this.tokenService.create(user);
            response.status(200).json(this.tokenService.getToken(token));
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({ error: 'Unauthorized' });
        }
    };


    private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        console.log('userData', userData)
        try {
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password)
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword
                });
            }
            response.status(200).json(user);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({error: 'Bad request', value: error.message});
        }
    };

    private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
        const {userId} = request.params;
        try {
            const result = await this.tokenService.remove(userId);
            console.log('aaa', result)
            response.status(200).json(result);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({error: 'Unauthorized'});
        }
    };

    private updatePassword = async (request: Request, response: Response, next: NextFunction) => {
        const { name } = request.params;
        const { newPassword } = request.body;

        if (!newPassword || newPassword.length < 6) {
            return response.status(400).json({ error: 'New password is required and must be at least 6 characters long.' });
        }

        try {
            const user = await this.userService.getByEmailOrName(name);
            if (!user) {
                return response.status(404).json({ error: 'User not found' });
            }

            const hashedPassword = await this.passwordService.hashPassword(newPassword);

            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword
            });

            response.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error(`Password update error: ${error.message}`);
            response.status(500).json({ error: 'Internal server error' });
        }
    };

    private cleanExpiredTokens = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.tokenService.removeExpiredTokens();
            res.status(200).json({ message: 'Usunięto przeterminowane tokeny', count: result.deletedCount });
        } catch (error) {
            res.status(500).json({ error: 'Błąd przy czyszczeniu tokenów' });
        }
    };
}

export default UserController;



