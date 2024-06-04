
import nodemailer from "nodemailer";
import config from "../configurations/config";

export type EmailOptions = {
    email: string;
    subject: string;
    template: string;
   
}




async function sendMail({ email, subject, template }: EmailOptions

): Promise<void> {

    const transporter = nodemailer.createTransport({
        host: config.smtp_host,
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        service:config.smtp_service ,
        auth: {
            user: config.smtp_user,
            pass: config.smtp_password,
        },
    });

    try {

        const info = await transporter.sendMail({
            from: config.smtp_user, to: email, subject, html: template
        });

        console.log("Message sent: %s", info.messageId);

    } catch (error) {

    }

}

export default sendMail;