import mongoose, { Document, Model, Schema } from "mongoose";


export interface IOrder extends Document {
    userId: string;
    courseId: string;
    payment_info: object
}


const orderSchema = new Schema<IOrder>({
    userId: {
        type: String,
        required: [true, "userId is Required"]
    },
    courseId: {
        type: String,
        required: [true, "courseId is Required"]
    }
    ,
    payment_info: {
        type: Object
    }

}, { timestamps: true })

const orderModel: Model<IOrder> = mongoose.model("Order", orderSchema);
export default orderModel