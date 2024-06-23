import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUserSchema } from '../../types/userTypes';

export interface IComment extends Document {
    user: IUserSchema;
    question: string;
    questionReplies: [{ answer: string }];
}

interface IReview extends Document {
    user: IUserSchema;
    rating: number;
    comment: string;
    commentReplies: IComment[];
}

export interface ILink extends Document {
    title: string;
    url: string;
}

export interface ICourseData extends Document {
    title: string;
    descriptions: string;
    contentVideo: string;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links?: ILink[];
    suggestion: string;
    questions: IComment[];
}

export interface ICourse extends Document {
    name: string;
    descriptions: string;
    price: number;
    estimatePrice?: number;
    thumbnail?: string;
    tags: string;
    level: string;
    demoVideo: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: IReview[];
    courseData: ICourseData[];
    ratings?: number;
    purchased?: number;
}

const commentSchema = new Schema<IComment>({
    user: { type: Object, required: true },
    question: { type: String, required: true },
    questionReplies: [{ answer: { type: String, required: true } }],
});

const reviewSchema = new Schema<IReview>({
    user: { type: Object, required: true },
    rating: { type: Number, default: 0, required: true },
    comment: { type: String, required: true },
    commentReplies: [commentSchema],
});

const linkSchema = new Schema<ILink>({
    title: { type: String, required: true },
    url: { type: String, required: true },
});

const courseDataSchema = new Schema<ICourseData>({
    title: { type: String, required: true },
    descriptions: { type: String, required: true },
    contentVideo: { type: String, required: true },
    videoSection: { type: String, required: true },
    videoLength: { type: Number, required: true ,default:0},
    // videoPlayer: { type: String, required: true },
    links: [linkSchema],
    suggestion: { type: String, required: true },
    questions: [commentSchema],
});

const courseSchema = new Schema<ICourse>({
    name: { type: String, required: true, trim: true, index: true },
    descriptions: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    estimatePrice: { type: Number },
    thumbnail: { type: String },
    tags: { type: String, required: true, trim: true, index: true },
    level: { type: String, required: true, trim: true, index: true },
    demoVideo: { type: String, required: true, trim: true },
    benefits: [{ title: { type: String, required: true } }],
    prerequisites: [{ title: { type: String, required: true } }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: { type: Number, default: 0 },
    purchased: { type: Number, default: 0 },
}, {
    timestamps: true
});

const courseModel: Model<ICourse> = mongoose.model('Course', courseSchema);
export default courseModel;
