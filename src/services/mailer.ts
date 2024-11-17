import dotenv from 'dotenv'
import { Mail } from '../types/types';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMessage = async (content: Mail) => {
    if (!content.html) {
        throw new Error("Message has no body")
    }
    const maildir = process.env.MAIL_DIR as string; 
    const {to, subject, html} = content; 
    const message = await resend.emails.send({
        from: maildir,
        to, subject, html,
    });
    // console.log(message);
    return message
}

// * Test Message
// const main = async () => {
//     const x = await sendMessage({
//         to: 'matarafael2004@gmail.com',
//         subject:  "test message",
//         html: `<div style="width: 100%; background-color: blue
//         "><b>Bold messagge</b></div>`
//     });
//     console.log(x)
// }
// main()