import nodemailer from "nodemailer";

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// send mail with defined transport object
const sendEmail = async (email) => {
  try {
    const result = await transporter.sendMail(email);
    console.log("Message send", result?.messageId);
  } catch (error) {
    console.log("Email Error", error);
  }
};

export const sendResetPasswordLinkEmail = (user, resetUrl) => {
  const { userEmail, userName } = user;

  const emailFormat = {
    from: `gyanX<${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: "Password Reset",
    html: `
      <table style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; border-collapse: collapse;">
          <tr>
              <td style="text-align: center;">
                  <h1>Reset Pasword</h1>
              </td>
          </tr>
          <tr>
              <td>
                  <p>Dear ${userName},</p>
                  <p>Please click the below link to reset your password. </p>
                  <p><a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;">Reset Now</a></p>
                  <p>If you did not want to  reset your account, please ignore this email.</p>
                  <p>Thank you,<br> gyanX</p>
              </td>
          </tr>
      </table>
      `,
  };

  sendEmail(emailFormat);
};
