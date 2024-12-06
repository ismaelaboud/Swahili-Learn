import nodemailer from 'nodemailer';
import logger from './logger';

// Email templates
const EMAIL_TEMPLATES = {
  RESET_PASSWORD: {
    subject: 'Reset Your Password - LMS System',
    html: (resetLink: string) => `
      <h1>Reset Your Password</h1>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  },
  WELCOME: {
    subject: 'Welcome to LMS System',
    html: (name: string) => `
      <h1>Welcome to LMS System!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for joining our learning platform. We're excited to have you on board!</p>
      <p>Start exploring courses and begin your learning journey today.</p>
    `,
  },
  COURSE_ENROLLMENT: {
    subject: 'Course Enrollment Confirmation',
    html: (courseName: string) => `
      <h1>Enrollment Confirmed</h1>
      <p>You have successfully enrolled in: ${courseName}</p>
      <p>You can now access your course materials and start learning.</p>
    `,
  },
};

// Create transporter
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
};

// Send email function
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"LMS System" <noreply@lms-system.com>',
      to,
      subject,
      html,
    });

    logger.info('Email sent successfully', { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const template = EMAIL_TEMPLATES.RESET_PASSWORD;
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html(resetLink),
  });
};

// Send welcome email
export const sendWelcomeEmail = async (to: string, name: string) => {
  const template = EMAIL_TEMPLATES.WELCOME;
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html(name),
  });
};

// Send course enrollment confirmation
export const sendEnrollmentEmail = async (to: string, courseName: string) => {
  const template = EMAIL_TEMPLATES.COURSE_ENROLLMENT;
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html(courseName),
  });
};

// Verify SMTP connection
export const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('SMTP connection verified successfully');
    return true;
  } catch (error) {
    logger.error('SMTP connection verification failed:', error);
    return false;
  }
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendEnrollmentEmail,
  verifyEmailConnection,
};
