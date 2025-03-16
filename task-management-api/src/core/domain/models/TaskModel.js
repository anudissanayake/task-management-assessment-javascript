import { TaskStatus } from "./TaskStatus.js";

export class Task {
    constructor(
      id,
      title,
      description,
      status = TaskStatus.PENDING,
      createdAt = new Date().toISOString(),
      updatedAt = new Date().toISOString(),
      fileUrl
    ) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.status = status || TaskStatus.PENDING;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
      this.fileUrl = fileUrl;
    }
  }
 