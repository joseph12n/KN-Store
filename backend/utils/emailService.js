/**
 * Servicio de Correo Electrónico
 *
 * Configura Nodemailer con las variables de entorno del servidor
 * y expone funciones para enviar correos del sistema de autenticación.
 *
 * Servicios compatibles: Gmail, SendGrid, Mailtrap (pruebas).
 *
 * @module utils/emailService
 */

const nodemailer = require('nodemailer');

// ==================== TRANSPORTER ====================

/**
 * Configura el transporter según las variables de entorno.
 * Por defecto usa Mailtrap para entornos de desarrollo.
 */
const createTransporter = () => {
  // Soporte para Mailtrap (host/port explícito) y servicios como Gmail
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ==================== FUNCIONES HELPERS ====================

/**
 * Envía el correo de recuperación de contraseña.
 *
 * @param {string} to    - Dirección de correo del destinatario
 * @param {string} token - Token único de recuperación
 */
const sendPasswordResetEmail = async (to, token) => {
  const transporter = createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}?reset_token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'KN-Store <no-reply@knstore.com>',
    to,
    subject: 'KN-Store — Recuperación de contraseña',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Recuperar contraseña</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>KN-Store</strong>.
          Haz clic en el botón de abajo para continuar. Este enlace es válido por <strong>1 hora</strong>.
        </p>
        <a href="${resetLink}"
           style="display: inline-block; background: #111827; color: #fff; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: 600;">
          Restablecer contraseña
        </a>
        <p style="margin-top: 24px; color: #9ca3af; font-size: 13px;">
          Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="color: #d1d5db; font-size: 11px;">KN-Store © 2026 — Documento confidencial</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Envía el correo de verificación de cuenta.
 *
 * @param {string} to    - Dirección de correo del destinatario
 * @param {string} token - Token único de verificación
 */
const sendVerificationEmail = async (to, token) => {
  const transporter = createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${frontendUrl}?verify_token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'KN-Store <no-reply@knstore.com>',
    to,
    subject: 'KN-Store — Verifica tu correo electrónico',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Verifica tu correo</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">
          Gracias por registrarte en <strong>KN-Store</strong>.
          Haz clic en el botón de abajo para verificar tu dirección de correo electrónico.
        </p>
        <a href="${verifyLink}"
           style="display: inline-block; background: #111827; color: #fff; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: 600;">
          Verificar correo
        </a>
        <p style="margin-top: 24px; color: #9ca3af; font-size: 13px;">
          Si no creaste una cuenta en KN-Store, ignora este correo.
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="color: #d1d5db; font-size: 11px;">KN-Store © 2026 — Documento confidencial</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
};
