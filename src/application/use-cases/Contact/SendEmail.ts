import { EmailService } from "../../../infrastructure/services/EmailService";

export class SendEmail {
  constructor(
    private emailService: EmailService
  ) {}

  async execute(data: {
    email: string;
    name: string;
    subject: string;
    message: string;
  }) {
    await this.emailService.sendContactEmail(data.email, data.name, data.subject, data.message);
  }
}
