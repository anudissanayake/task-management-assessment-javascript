/* eslint-disable no-unused-vars */
export const TaskPort = {
  /**
   * Creates a new task in the repository.
   * @param {Object} task - The task object to create.
   * @throws Will throw an error if not implemented.
   */
  create: async (task) => {
    throw new Error("Method 'create' must be implemented.");
  },

  /**
   * Finds a task by its ID.
   * @param {string} id - The ID of the task to find.
   * @returns {Promise<Object|null>} A promise resolving to the task or null if not found.
   * @throws Will throw an error if not implemented.
   */
  findById: async (id) => {
    throw new Error("Method 'findById' must be implemented.");
  },

  /**
   * Retrieves all tasks from the repository.
   * @returns {Promise<Object[]>} A promise resolving to an array of tasks.
   * @throws Will throw an error if not implemented.
   */
  findAll: async () => {
    throw new Error("Method 'findAll' must be implemented.");
  },

  /**
   * Updates an existing task in the repository.
   * @param {Object} task - The updated task object.
   * @throws Will throw an error if not implemented.
   */
  update: async (task) => {
    throw new Error("Method 'update' must be implemented.");
  },

  /**
   * Deletes a task by its ID.
   * @param {string} id - The ID of the task to delete.
   * @throws Will throw an error if not implemented.
   */
  delete: async (id) => {
    throw new Error("Method 'delete' must be implemented.");
  },
};
