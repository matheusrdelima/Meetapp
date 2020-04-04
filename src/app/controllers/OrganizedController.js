import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

class OrganizedController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      attributes: ['title', 'description', 'location', 'date', 'past'],
      include: [
        {
          model: File,
          attributes: ['name', 'path', 'url'],
        },
        {
          model: User,
        },
      ],
    });

    res.json(meetups);
  }
}

export default new OrganizedController();
