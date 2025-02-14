import nodemailer from "nodemailer";

export class EmailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendWelcomeEmail(email: string, name: string) {
    await this.transporter.sendMail({
      from: `"Equipo de Turismomza" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "¡Bienvenido a la plataforma de Turismomza!",
      html: `<h1>Bienvenido, ${name}!</h1>
             <p>Gracias por registrarte en nuestra plataforma. ¡Esperamos que disfrutes de la experiencia!</p>`,
    });
  }

  async send2FACode(email: string, code?: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your two-factor authentication code",
      text: `Your code is ${code}`,
    });
  }

  async sendPasswordUpdateEmail(email: string, name: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Tu contraseña ha sido actualizada",
      text: `Hola ${name},\n\nTu contraseña ha sido actualizada exitosamente. Si no fuiste tú quien realizó este cambio, por favor contacta a nuestro soporte.\n\nSaludos,\nEl equipo de Turismomza.`,
    });
  }

  async sendContactEmail(
    email: string,
    name: string,
    subject: string,
    message: string
  ) {
    await this.transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: subject,
      text: message,
      html: `
      <p>Has recibido un nuevo mensaje de contacto.</p>
      <h3>Detalles:</h3>
      <ul>
        <li><strong>Nombre:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Asunto:</strong> ${subject}</li>
        <li><strong>Mensaje:</strong> ${message}</li>
      </ul>
    `,
    });
  }
}
