// This file defines all the external api services
import axios from 'axios';

// URL for External API
const API_URL = 'https://jsonplaceholder.typicode.com/users';

export class UserExternalApiService {

  constructor(dbRepository) {
    this.dbRepository = dbRepository;
  }
  fetchUsers = async () => {
    const cacheKey = 'users'; // Cache key

    // Check if data is cached
    const cachedData = await this.dbRepository.getFromCache(cacheKey);
    if (Array.isArray(cachedData) && cachedData.length !== 0) {
      return cachedData;
    }

    // If not cached, fetch from the external API
    try {
      const response = await axios.get(API_URL);
      const users = response.data;

      // Cache the API response
      await this.dbRepository.putInCache(cacheKey, users);
      return users;

    } catch (error) {
      if (error && error.message) {
        console.error(`Error fetching data from external API: ${error.message}`, error);
      } else {
        console.error(`An unknown error occurred:`, error);
      }
      throw error;
    }
  };
}