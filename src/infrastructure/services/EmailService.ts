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
}
