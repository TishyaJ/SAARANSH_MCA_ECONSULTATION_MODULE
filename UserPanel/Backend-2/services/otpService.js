// const twilio = require('twilio');
// const nodemailer = require('nodemailer');
// require('dotenv').config();

// // Random 6-digit OTP generate karne ke liye
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Twilio client initialize karne ke liye
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// // Email transporter initialize karne ke liye
// const emailTransporter = nodemailer.createTransport({
//   service: process.env.EMAIL_SERVICE,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// // OTP SMS bhejne ke liye (Twilio use karke)
// const sendOTPViaSMS = async (phoneNumber, otp) => {
//   try {
//     const message = await twilioClient.messages.create({
//       body: `Your MCA E-Consultation OTP is: ${otp}. Valid for 10 minutes.`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: phoneNumber
//     });
//     console.log(`SMS sent successfully. SID: ${message.sid}`);
//     return { success: true, messageId: message.sid };
//   } catch (error) {
//     console.error('Error sending SMS:', error);
//     return { success: false, error: error.message };
//   }
// };

// // OTP email bhejne ke liye
// const sendOTPViaEmail = async (email, otp, userName = 'User') => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'MCA E-Consultation - Your OTP',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
//           <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
//             <h2 style="color: #003087; margin: 0;">MCA E-Consultation</h2>
//             <p style="color: #666; margin: 10px 0;">Ministry of Corporate Affairs</p>
//           </div>
          
//           <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0;">
//             <p style="color: #333; font-size: 16px;">Hello ${userName},</p>
            
//             <p style="color: #555; line-height: 1.6;">
//               Your One-Time Password (OTP) for MCA E-Consultation submission is:
//             </p>
            
//             <div style="text-align: center; margin: 30px 0;">
//               <div style="font-size: 32px; font-weight: bold; color: #003087; letter-spacing: 5px; background-color: #f0f4f8; padding: 20px; border-radius: 5px;">
//                 ${otp}
//               </div>
//             </div>
            
//             <p style="color: #d9534f; font-weight: bold;">
//               ⚠️ This OTP is valid for 10 minutes only.
//             </p>
            
//             <p style="color: #666; font-size: 14px; line-height: 1.6;">
//               If you did not request this OTP, please ignore this email. Do not share this OTP with anyone.
//             </p>
            
//             <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            
//             <p style="color: #999; font-size: 12px; text-align: center;">
//               This is an automated email. Please do not reply to this message.
//             </p>
//           </div>
//         </div>
//       `
//     };

//     const info = await emailTransporter.sendMail(mailOptions);
//     console.log(`Email sent successfully. Response: ${info.response}`);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return { success: false, error: error.message };
//   }
// };

// // OTP ko memory me store karta hai (production me DB+expiry use karein)
// const otpStore = new Map();

// const storeOTP = (email, otp) => {
//   const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//   otpStore.set(email, { otp, expiryTime, attempts: 0 });
// };

// const verifyOTP = (email, otp) => {
//   const stored = otpStore.get(email);
  
//   if (!stored) {
//     return { valid: false, message: 'OTP not found. Please request a new one.' };
//   }

//   if (new Date() > stored.expiryTime) {
//     otpStore.delete(email);
//     return { valid: false, message: 'OTP has expired. Please request a new one.' };
//   }

//   if (stored.attempts >= 3) {
//     otpStore.delete(email);
//     return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
//   }

//   if (stored.otp !== otp) {
//     stored.attempts += 1;
//     return { valid: false, message: 'Invalid OTP. Please try again.' };
//   }

//   otpStore.delete(email);
//   return { valid: true, message: 'OTP verified successfully!' };
// };

// module.exports = {
//   generateOTP,
//   sendOTPViaSMS,
//   sendOTPViaEmail,
//   storeOTP,
//   verifyOTP
// };
