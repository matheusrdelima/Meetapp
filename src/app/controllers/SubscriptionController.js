import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          include: [
            {
              model: User,
              attributes: ['name', 'email'],
            },
          ],
          order: [['date', 'ASC']],
        },
      ],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const { meetup_id } = req.body;

    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(meetup_id);

    if (!meetup) {
      return res.json({ error: 'Meetup not found' });
    }

    if (meetup.user_id === req.userId) {
      return res.json({
        error: 'This meetup is organized by you, unable to subscribe',
      });
    }

    if (meetup.past) {
      return res.json({ error: 'Past dates are not permitted' });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: meetup.id,
    });

    const userEmail = await User.findByPk(meetup.user_id);

    await Queue.add(RegistrationMail.key, {
      userEmail,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
