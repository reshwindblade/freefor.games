const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // Generate verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send email verification
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: `"FreeFor.Games" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Verify Your Email - FreeFor.Games',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 Welcome to FreeFor.Games!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.profile.displayName},</h2>
              <p>Thanks for joining FreeFor.Games! Please verify your email address to complete your registration.</p>
              
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
              
              <p>Happy gaming!</p>
              <p>The FreeFor.Games Team</p>
            </div>
            <div class="footer">
              <p>© 2025 FreeFor.Games. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(user) {
    const profileUrl = `${process.env.FRONTEND_URL}/${user.username}`;
    
    const mailOptions = {
      from: `"FreeFor.Games" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Welcome to FreeFor.Games! 🎮',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #6366f1; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to FreeFor.Games!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.profile.displayName},</h2>
              <p>Your email has been verified! Welcome to the gaming community.</p>
              
              <div class="feature">
                <h3>🎮 Your Gaming Profile</h3>
                <p>Share your availability with the gaming community:</p>
                <a href="${profileUrl}" class="button">View Your Profile</a>
              </div>
              
              <div class="feature">
                <h3>📅 Set Your Availability</h3>
                <p>Let others know when you're free to play by setting up your gaming schedule.</p>
              </div>
              
              <div class="feature">
                <h3>🔍 Discover Players</h3>
                <p>Find other gamers with matching schedules and game preferences.</p>
              </div>
              
              <p>Ready to get started?</p>
              <a href="${process.env.FRONTEND_URL}/availability/edit" class="button">Set Your Availability</a>
              <a href="${process.env.FRONTEND_URL}/explore" class="button">Explore Players</a>
              
              <p>Happy gaming!</p>
              <p>The FreeFor.Games Team</p>
            </div>
            <div class="footer">
              <p>© 2025 FreeFor.Games. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email server connection successful');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();