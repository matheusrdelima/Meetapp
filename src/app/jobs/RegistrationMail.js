import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { userEmail, user } = data;

    await Mail.sendMail({
      to: `${userEmail.name} <${userEmail.email}>`,
      subject: 'Nova Inscrição!',
      template: 'registration',
      context: {
        provider: userEmail.name,
        user: user.name,
      },
    });
  }
}

export default new RegistrationMail();
