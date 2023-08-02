// src/services/userService.ts
import UserModel, { User } from '../dbms/models/user';

const UserService = {
    async create(username: string, hashedPassword: string): Promise<User> {
        try {
            return await UserModel.create({ username, hashedPassword });
        } catch (error) {
            throw new Error('Failed to create user.'); // Custom error message
        }
    },
    

    async findByUsername(username: string): Promise<User | null> {
        const lowercaseUsername = username.toLowerCase();
        try {
            return await UserModel.findOne({ username: lowercaseUsername });
        } catch (error) {
            return null
        }
    },

    async findByUuid(uuid: string): Promise<User | null> {
        try {
            return await UserModel.findOne({ uuid: uuid });
        } catch (error) {
            return null
        }
    },
};

export default UserService;
