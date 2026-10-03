import { getMemberDashboardData } from '../services/member.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await getMemberDashboardData(req.user.id);
    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};
