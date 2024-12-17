
/**
 * Implemented GET for External API
 */
export class UserExternalApiController {
  constructor(userService) {
    this.userService = userService;
  }

  /**
  * @param {Object} req 
  * @param {Object} res - object with 200 and data
   */
  getUsers = async (req, res, next) => {
    try {
      const users = await this.userService.fetchUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }
}