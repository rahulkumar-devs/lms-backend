import { IUserSchema } from './../../types/userTypes';
import mongoose, { Model, Schema } from "mongoose";
import bcryptjs from "bcryptjs"

const emailRegex: RegExp = /^[^\$@]+@[^\$@]+\.[^$@]+$/


const userSchema: Schema<IUserSchema> = new Schema({
    name: {
        type: String,
        required: [true, "name is Required"]


    },
    email: {
        type: String,
        required: [true, "Email is Required"],
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
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs.hash(this.password,10);
    next()

})


userSchema.methods.comparePassword = async function(enteredPassword:string):Promise<boolean>{
    return await bcryptjs.compare(enteredPassword,this.password);
}


const userModel :Model<IUserSchema> =mongoose.model("User",userSchema);
export default userModel;