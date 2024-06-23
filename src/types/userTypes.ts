
import mongoose from "mongoose";

export interface IUserSchema extends mongoose.Document {

    name: string;
    email: string;
    password: string;
    avatar: any;
    roles: ("admin" | "member" | "user")[];
    isVarified: boolean;
    courses: Array<{ courseId: string }>;
    comparePassword: (password: string) => Promise<boolean>;
    signAccessToken:()=> Promise<string>
    signRefreshToken:()=>  Promise<string>
}


export type IRegisterUser = {
    name: string;
    email: string;
    password: string;
    avatar?: {
        public_id: string;
        url: string;
    },

}

export  type IActivationToken = {
    activationToken:string;
activationCode:string;
} 