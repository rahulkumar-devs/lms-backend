import { Schema, model, Document } from "mongoose";

// Interface for FAQ items
interface FaqItem extends Document {
    question: string;
    answer: string;
}

// Interface for Categories
interface ICategory extends Document {
    title: string;
}

// Interface for Banner Images
interface BannerImage extends Document {
    public_id: string;
    url: string;
}

// Interface for Layout
interface Layout extends Document {
    type: string;
    faq: FaqItem[];
    categories: ICategory[];
    banner: {
        image: BannerImage;
        title: string;
        subtitle: string;
    };
}

// FAQ Schema
const faqSchema = new Schema<FaqItem>({
    question: { type: String},
    answer: { type: String},
});

// Category Schema
const categorySchema = new Schema<ICategory>({
    title: { type: String},
});

// Banner Image Schema
const BannerImageSchema = new Schema<BannerImage>({
    public_id: { type: String},
    url: { type: String},
});

// Layout Schema
const layoutSchema = new Schema<Layout>({
    type: { type: String},
    faq: { type: [faqSchema], default: [] },
    categories: { type: [categorySchema], default: [] },
    banner: {
        image: { type: BannerImageSchema},
        title: { type: String},
        subtitle: { type: String},
    },
});

// Layout Model
const layoutModel = model<Layout>('Layout', layoutSchema);

export default layoutModel;
