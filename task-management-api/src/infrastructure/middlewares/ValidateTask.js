export const validateTask = (req, res, next) => {
    const { title, description } = req.body;
    if (!title || !description) {
      res.status(400).json({ message: 'Title and description are required.' });
      return;
    }
    next();
  };
  
  export const validateUpdateTask = (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: 'Task id is required.' });
      return;
    }
    next();
  };  