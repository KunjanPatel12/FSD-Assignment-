import {
  getAssignedMembers as fetchAssignedMembers,
  getMemberDetailsForTrainer as fetchMemberDetails,
} from '../services/trainer.service.js';

export const getAssignedMembers = async (req, res, next) => {
  try {
    const members = await fetchAssignedMembers(req.user.id);
    return res.status(200).json({
      status: 'success',
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberDetails = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const details = await fetchMemberDetails(req.user.id, memberId);
    return res.status(200).json({
      status: 'success',
      data: details,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};
