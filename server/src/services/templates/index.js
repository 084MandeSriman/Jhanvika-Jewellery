import { baseTemplate } from "./base.js";

export const registrationEmail = (name) =>
  baseTemplate("Verify Your Email", `<p>Hi ${name},</p><p>Welcome to Jhanvika Jewelleries! Please verify your email to activate your account using the OTP sent separately.</p>`);

export const welcomeEmail = (name) =>
  baseTemplate("Welcome to Jhanvika Jewelleries", `<p>Hi ${name},</p><p>Your account is ready. Explore handcrafted bridal and everyday jewellery, curated just for you.</p>`);

export const forgotPasswordEmail = (name, otp) =>
  baseTemplate("Reset Your Password", `<p>Hi ${name},</p><p>Your password reset code is:</p><p style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#c9982f;">${otp}</p><p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`);

export const orderConfirmationEmail = (name, order) =>
  baseTemplate(
    "Order Confirmed!",
    `<p>Hi ${name},</p><p>Thank you for your order <b>${order.orderNumber}</b>.</p>
     <table style="width:100%; font-size:14px; margin-top:12px;">
       ${order.items.map((i) => `<tr><td>${i.name} × ${i.qty}</td><td style="text-align:right;">₹${i.price * i.qty}</td></tr>`).join("")}
     </table>
     <p style="margin-top:16px; font-size:18px;"><b>Total: ₹${order.total}</b></p>
     <p>We'll email you again once your order ships.</p>`
  );

export const invoiceEmail = (name, order) =>
  baseTemplate("Your Invoice", `<p>Hi ${name},</p><p>Please find attached the invoice for order <b>${order.orderNumber}</b>.</p>`);

export const shippingUpdateEmail = (name, orderNumber, status) =>
  baseTemplate("Order Update", `<p>Hi ${name},</p><p>Your order <b>${orderNumber}</b> status has been updated to: <b style="color:#c9982f; text-transform:capitalize;">${status}</b>.</p>`);

export const deliveryConfirmationEmail = (name, orderNumber) =>
  baseTemplate("Delivered!", `<p>Hi ${name},</p><p>Your order <b>${orderNumber}</b> has been delivered. We hope you love it! Do share a review.</p>`);

export const returnStatusEmail = (name, orderNumber, status) =>
  baseTemplate("Return Update", `<p>Hi ${name},</p><p>Your return request for order <b>${orderNumber}</b> is now: <b style="text-transform:capitalize;">${status}</b>.</p>`);

export const contactAckEmail = (name) =>
  baseTemplate("We've received your message", `<p>Hi ${name},</p><p>Thanks for reaching out to Jhanvika Jewelleries. Our team will get back to you within 24 hours.</p>`);

export const newsletterEmail = (name = "there") =>
  baseTemplate("You're subscribed!", `<p>Hi ${name},</p><p>You'll now be the first to hear about new collections, festive edits and members-only previews.</p>`);

export const otpEmail = (name, otp, purpose) =>
  baseTemplate(
    "Your One-Time Password",
    `<p>Hi ${name || "there"},</p><p>Your OTP for ${purpose.replace("_", " ")} is:</p><p style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#c9982f;">${otp}</p><p>This code expires in 10 minutes.</p>`
  );
