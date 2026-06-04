import { apiClient } from './api';

export interface CreateReviewDto {
  professionalId: number;
  bookingId: number;
  rating: number;
  comment?: string;
}

export const reviewService = {
  createReview: async (data: CreateReviewDto) => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  getProfessionalReviews: async (professionalId: number | string) => {
    const response = await apiClient.get(`/reviews/professional/${professionalId}`);
    return response.data;
  }
};
