// This file defines all the task services
export class TaskService {
  constructor(dbRepository) {
    this.dbRepository = dbRepository;
  }

  async createTask(task) {
    return await this.dbRepository.create(task);
  }

  async getTasks() {
    return await this.dbRepository.findAll(); // Calls the repository method to retrieve all tasks
  }

  async getTaskById(id) {
    return await this.dbRepository.findById(id); // Calls the repository method to retrieve task by id
  }

  async updateTask(task) {
    return await this.dbRepository.update(task); // Calls the repository method to update the task
  }

  async deleteTask(id) {
    await this.dbRepository.delete(id); // Calls the repository method to delete the task by id
  }
}
