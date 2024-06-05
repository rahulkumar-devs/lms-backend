import { IUserSchema } from './../../types/userTypes';
import mongoose, { Model, Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"
import config from '../../configurations/config';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const userSchema: Schema<IUserSchema> = new Schema({
    name: {
        type: String,
        required: [true, "name is Required"]


    },
    email: {
        type: String,
        required: [true, "Email is Required"],
        unique: true,
        validate: {
            validator: function (value: string) {
                return emailRegex.test(value)
            },
            message: "Please enter a valid email"

        },

    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [4, "Password must be at least 6 character"],
        select: false
    },

    avatar: {
        public_id: String,
        url: String
    },
    roles: {
        type: [String],
        enum: ["admin", "member", "user"],
        default: ["user"]
    },

    isVarified: { type: Boolean, default: false },
    courses: [
        {
            courseId: String
        }
    ]


},
    {
        timestamps: true
    }
)


userSchema.pre<IUserSchema>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});


userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcryptjs.compare(enteredPassword, this.password);
};


userSchema.methods.signAccessToken = async function (): Promise<string> {
console.log(config.access_token_expiry*60_000);
    return jwt.sign({ _id: this._id }, config.access_token_key, { expiresIn: "5m"})


}
userSchema.methods.signRefreshToken = async function () {

    return jwt.sign({ _id: this._id }, config.refresh_token_key, { expiresIn:"7d"})
}

const userModel: Model<IUserSchema> = mongoose.model("User", userSchema);
export default userModel;
