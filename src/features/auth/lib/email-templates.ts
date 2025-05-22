// src/features/auth/lib/email-templates.ts

// Reusable email template generator
export const createEmailTemplate = (options: {
    title: string;
    message: string;
    buttonText?: string;
    buttonLink?: string;
    additionalContent?: string;
    footer?: string;
  }) => {
    const { title, message, buttonText, buttonLink, additionalContent, footer } = options;
    return `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #555;">${title}</h2>
        <p>${message}</p>
        ${
          buttonLink && buttonText
            ? `
          <div style="text-align: center; margin: 30px;">
            <a href="${buttonLink}" 
               style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
               ${buttonText}
            </a>
          </div>
          <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
          <p style="word-break: break-all;"><a href="${buttonLink}">${buttonLink}</a></p>
        `
            : ''
        }
        ${additionalContent ? `<p>${additionalContent}</p>` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        ${footer ? `<p style="font-size: 12px; color: #888;">${footer}</p>` : ''}
      </div>
    `;
};