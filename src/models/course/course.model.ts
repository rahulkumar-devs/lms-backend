import mongoose, { Document, Model, Schema } from "mongoose";

// Interface Definitions
interface IComment extends Document {
    user: mongoose.Types.ObjectId;
    comment: string;
}

interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    commentReplies: IComment[];
}

interface ILink extends Document {
    title: string;
    url: string;
}

interface ICourseData extends Document {
    title: string;
    descriptions: string;
    videoUrl: string;
    videoThumbnail: { public_id: string; url: string };
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink[];
    suggestion: string;
    questions: IComment[];
}

interface ICourse extends Document {
    name: string;
    descriptions: string;
    price: number;
    estimatePrice?: number;
    thumbnail: { public_id: string; url: string };
    tags: string;
    level: string;
    demoUrl: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: IReview[];
    courseData: ICourseData[];
    ratings?: number;
    purchased?: number;
}

// Schema Definitions
const commentSchema = new Schema<IComment>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    comment: {
        type: String,
        required: [true, "Comment is required"],
    },
});

const reviewSchema = new Schema<IReview>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    rating: {
        type: Number,
        default: 0,
        required: [true, "Rating is required"],
    },
    comment: {
        type: String,
        required: [true, "Comment is required"],
    },
    commentReplies: [commentSchema],
});

const linkSchema = new Schema<ILink>({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    url: {
        type: String,
        required: [true, "URL is required"],
    },
});

const courseDataSchema = new Schema<ICourseData>({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    descriptions: {
        type: String,
        required: [true, "Descriptions are required"],
    },
    videoUrl: {
        type: String,
        required: [true, "Video URL is required"],
    },
    videoThumbnail: {
        public_id: {
            type: String,
            required: [true, "Video thumbnail public ID is required"],
        },
        url: {
            type: String,
            required: [true, "Video thumbnail URL is required"],
        },
    },
    videoSection: {
        type: String,
        required: [true, "Video section is required"],
    },
    videoLength: {
        type: Number,
        required: [true, "Video length is required"],
    },
    videoPlayer: {
        type: String,
        required: [true, "Video player is required"],
    },
    links: [linkSchema],
    suggestion: {
        type: String,
        required: [true, "Suggestion is required"],
    },
    questions: [commentSchema],
});

const courseSchema = new Schema<ICourse>({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    descriptions: {
        type: String,
        required: [true, "Descriptions are required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    estimatePrice: Number,
    thumbnail: {
        public_id: {
            type: String,
            required: [true, "Thumbnail public ID is required"],
        },
        url: {
            type: String,
            required: [true, "Thumbnail URL is required"],
        },
    },
    tags: {
        type: String,
        required: [true, "Tags are required"],
    },
    level: {
        type: String,
        required: [true, "Level is required"],
    },
    demoUrl: {
        type: String,
        required: [true, "Demo URL is required"],
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchased: {
        type: Number,
        default: 0,
    },
});

// Model Definition
const courseModel: Model<ICourse> = mongoose.model("Course", courseSchema);
export default courseModel;