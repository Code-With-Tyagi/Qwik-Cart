import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.log("Email server connection failed:", error);
    } else {
        console.log("Email server ready");
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const recipient = typeof to === "string" ? to.trim() : "";

        if (!recipient) {
            throw new Error("Recipient email address is required.");
        }

        const info = await transporter.sendMail({
            from: `"Qwik Cart" <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject,
            text,
            html
        });

        console.log("Message Sent:", info.messageId);
        return info;

    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};

export const sendRegistrationMail = async function(to, otp) {
    try {
        const subject = "QwikCart - Email Verification OTP";
        const text = `Welcome to QwikCart! Your OTP code is: ${otp}. This code is valid for 10 minutes.`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome!</h2>
                    
                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        Thank you for registering with QwikCart. Please verify your email address by entering the OTP code below:
                    </p>
                    
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                        <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">Your OTP Code:</p>
                        <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 2px; margin: 0;">${otp}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        <strong>Important:</strong> This code is valid for 10 minutes only. Do not share this code with anyone.
                    </p>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                        If you did not request this verification, please ignore this email.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email. Please do not reply to this address.
                    </p>
                </div>
            </div>
        `;
        
        await sendEmail(to, subject, text, html);
        console.log("Registration email sent successfully to:", to);
        
    } catch (error) {
        console.log("Error sending registration mail:", error);
        throw error;
    }
};

export const sendEmailUpdateOtpMail = async (to, userName, otp) => {
  try {
    const subject = "Verify Your New Email Address - QwikCart";

    const text = `Your OTP for changing your QwikCart email address is ${otp}. This OTP is valid for 10 minutes.`;

    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verify Your New Email</h2>
                    
                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        Hi <strong>${userName}</strong>,
                    </p>

                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        We received a request to change the email address associated with your QwikCart account. Please verify your new email address by entering the OTP code below:
                    </p>
                    
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                        <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">Your OTP Code:</p>
                        <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 2px; margin: 0;">${otp}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        <strong>Important:</strong> This code is valid for 10 minutes only. Do not share this code with anyone.
                    </p>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                        If you did not request this change, you can safely ignore this email. Your current email address will remain unchanged.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email. Please do not reply to this address.
                    </p>
                </div>
            </div>
    `;

    await sendEmail(to, subject, text, html);

    console.log("Email update OTP sent successfully.");

  } catch (error) {
    console.log("Error sending email update OTP:", error);
    throw error;
  }
};

export const sendMobileUpdateMail = async (to, userName, otp) => {
  try {
    const subject = "Verify Your Mobile Number Update - QwikCart";

    const text = `Your OTP for changing your QwikCart mobile number is ${otp}. This OTP is valid for 10 minutes.`;

    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verify Your Mobile Number Update</h2>
                    
                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        Hi <strong>${userName}</strong>,
                    </p>

                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        We received a request to change the mobile number associated with your QwikCart account. Please verify this request by entering the OTP code below:
                    </p>
                    
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                        <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">Your OTP Code:</p>
                        <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 2px; margin: 0;">${otp}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        <strong>Important:</strong> This code is valid for 10 minutes only. Do not share this code with anyone.
                    </p>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                        If you did not request this change, you can safely ignore this email. Your current mobile number will remain unchanged.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email. Please do not reply to this address.
                    </p>
                </div>
            </div>
    `;

    await sendEmail(to, subject, text, html);

    console.log("Mobile update OTP sent successfully.");

  } catch (error) {
    console.log("Error sending mobile update OTP:", error);
    throw error;
  }
};

export const sendAccountReactivationMail = async (to, userName, otp) => {
  try {
    const subject = "Reactivate Your Account - QwikCart";

    const text = `Your OTP to reactivate your QwikCart account is ${otp}. This OTP is valid for 10 minutes.`;

    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Reactivate Your Account</h2>
                    
                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        Hi <strong>${userName}</strong>,
                    </p>

                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        We received a request to reactivate your QwikCart account. To complete this process and restore your access, please verify your request by entering the OTP code below:
                    </p>
                    
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                        <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">Your OTP Code:</p>
                        <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 2px; margin: 0;">${otp}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        <strong>Important:</strong> This code is valid for 10 minutes only. Do not share this code with anyone.
                    </p>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                        If you did not request to reactivate your account, you can safely ignore this email. Your account will remain inactive.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email. Please do not reply to this address.
                    </p>
                </div>
            </div>
    `;

    await sendEmail(to, subject, text, html);

    console.log("Account reactivation OTP sent successfully.");

  } catch (error) {
    console.log("Error sending account reactivation OTP:", error);
    throw error;
  }
};

export const sendForgotPasswordMail = async (to, userName, otp) => {
  try {
    const subject = "Reset Your Password - QwikCart";

    const text = `Your OTP to reset your QwikCart account password is ${otp}. This OTP is valid for 10 minutes.`;

    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
                    
                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        Hi <strong>${userName}</strong>,
                    </p>

                    <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                        We received a request to reset the password for your QwikCart account. To continue, please verify your identity by entering the OTP code below:
                    </p>
                    
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                        <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">Your OTP Code:</p>
                        <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 2px; margin: 0;">${otp}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        <strong>Important:</strong> This code is valid for 10 minutes only. Do not share this code with anyone.
                    </p>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                        If you did not request a password reset, you can safely ignore this email. Your account will remain secure, and no changes will be made.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email. Please do not reply to this address.
                    </p>
                </div>
            </div>
    `;

    await sendEmail(to, subject, text, html);

    console.log("Forgot password OTP sent successfully.");

  } catch (error) {
    console.log("Error sending forgot password OTP:", error);
    throw error;
  }
};
