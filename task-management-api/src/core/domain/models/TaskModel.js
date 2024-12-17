export class Task {
    constructor(
      id,
      title,
      description,
      status = 'pending',
      createdAt = new Date().toISOString(),
      updatedAt = new Date().toISOString(),
      fileUrl
    ) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.status = status;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
      this.fileUrl = fileUrl;
    }
  }
 