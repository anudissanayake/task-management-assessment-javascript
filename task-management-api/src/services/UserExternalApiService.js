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

    try {
      // Try to get data from cache
      const cachedData = await this.dbRepository.getFromCache(cacheKey);
      if (Array.isArray(cachedData) && cachedData.length > 0) {
        console.log('Returning cached user data');
        return cachedData;
      }

      console.log('Fetching fresh user data from external API');
      const response = await axios.get(API_URL);
      const users = response.data;

      // Cache the API response
      await this.dbRepository.putInCache(cacheKey, users);
      return users;

    } catch (error) {
      console.error(`Error in fetchUsers: ${error.message}`, error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  };
}