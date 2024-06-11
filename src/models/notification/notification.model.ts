import mongoose, { Document, Model, Schema } from "mongoose";

interface INotification extends Document {
    title: string;
    message: string;
    status: string;
    isRead: boolean;
    userId: string;
}


const notificationSchema = new Schema<INotification>({
    title: {
        type: String,
        required: [true, "title required"]
    },
    message: {
        type: String,
        required: [true, "message required"]
    },
    status: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: [true, "UserId required"]
    }
}, { timestamps: true })

const notificationModel: Model<INotification> = mongoose.model("Notification", notificationSchema);
export default notificationModel;