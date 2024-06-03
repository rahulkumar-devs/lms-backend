
import mongoose from "mongoose";

export interface IUserSchema extends mongoose.Document {

    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    };
    roles: ("admin" | "member" | "user")[];
    isVarified: boolean;
    courses: Array<{ courseId: string }>;
    comparePassword: (password: string) => Promise<boolean>;
}

