import { Feedback } from '@/components/emails/Feedback';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
  const { email, firstName } = req.body;

  const { data, error } = await resend.emails.send({
    from: 'Jewel <no-reply@usejewel.app>',
    to: [email],
    subject: 'Jewel Journaling Weekly Update',
    react: Feedback({ firstName }),
  });

  if (error) {
    return res.status(400).json(error);
  }

  res.status(200).json(data);
};
