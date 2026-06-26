import config from "../config";
import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  resetPassLink?: string,
  confirmLink?: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: config.sendEmail.brevo_email,
      pass: config.sendEmail.brevo_pass,
    },
  });

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const clickableResetPass = `<a href="${resetPassLink}" style="color: #28C76F; text-decoration: underline;">here</a>`;
  const clickableConfirm = `<a href="${confirmLink}" style="color: #28C76F; text-decoration: underline;">here</a>`;

  const html = `
  <div style="max-width: 600px; margin: 0 auto; background-color: #F6F7F9; color: #000; border-radius: 8px; padding: 24px;">
    <table style="width: 100%;">
      <tr>
        <td>
          <div style="padding: 5px; text-align: center;">
            <img src="https://res.cloudinary.com/shariful10/image/upload/v1751971147/logo_cfqynn.png" alt="logo" style="height: 40px; margin-bottom: 16px;" />
          </div>
        </td>
        <td style="text-align: right; color: #999;">${formattedDate}</td>
      </tr>
    </table>

    
    ${
      confirmLink
        ? `<h3 style="text-align: center; color: #000;">Verify Your Email Within 10 Minutes</h3>
       <div style="padding: 0 1em;">
         <p style="text-align: left; line-height: 28px; color: #000;">
           <strong style="color: #000;">Verification Link:</strong> Click ${clickableConfirm} to verify your email.
         </p>
       </div>`
        : `<h3 style="text-align: center; color: #000;">Reset Your Password Within 10 Minutes</h3>
       <div style="padding: 0 1em;">
         <p style="text-align: left; line-height: 28px; color: #000;">
           <strong style="color: #000;">Reset Link:</strong> Click ${clickableResetPass} to reset your password.
         </p>
       </div>`
    }
  </div>
  `;

  await transporter.sendMail({
    from: `"Ai Powered Facial" <${config.sendEmail.email_from}>`,
    to,
    subject: `${
      resetPassLink
        ? `Reset Your Password within 5 Minutes.`
        : `Verify Your Email within 5 Minutes.`
    }`,
    text: "Hello world?",
    html: html,
  });
};
