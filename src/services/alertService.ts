import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface AlertApiData {
  id: string;
  message: string;
  type: 'WARNING' | 'DANGER' | 'INFO';
  status: 'PENDING' | 'SEEN' | 'DISMISSED';
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export const alertService = {
  /**
   * Get all alerts
   */
  getAll: async (): Promise<ApiResponse<AlertApiData[]>> => {
    return api.get<ApiResponse<AlertApiData[]>>('/alerts', true);
  },

  /**
   * Get alert by ID
   */
  getById: async (id: string): Promise<ApiResponse<AlertApiData>> => {
    return api.get<ApiResponse<AlertApiData>>(`/alerts/${id}`, true);
  },

  /**
   * Get unread alerts
   */
  getUnread: async (): Promise<ApiResponse<AlertApiData[]>> => {
    return api.get<ApiResponse<AlertApiData[]>>('/alerts/unread', true);
  },

  /**
   * Get count of unread alerts
   */
  getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
    return api.get<ApiResponse<UnreadCountResponse>>('/alerts/count/unread', true);
  },

  /**
   * Mark alert as seen
   */
  markSeen: async (id: string): Promise<ApiResponse<AlertApiData>> => {
    return api.patch<ApiResponse<AlertApiData>>(`/alerts/${id}/seen`, undefined, true);
  },

  /**
   * Mark all alerts as seen
   */
  markAllSeen: async (): Promise<ApiResponse<null>> => {
    return api.patch<ApiResponse<null>>('/alerts/mark-all-seen', undefined, true);
  },

  /**
   * Dismiss alert
   */
  dismiss: async (id: string): Promise<ApiResponse<AlertApiData>> => {
    return api.patch<ApiResponse<AlertApiData>>(`/alerts/${id}/dismiss`, undefined, true);
  },

  /**
   * Delete alert
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/alerts/${id}`, true);
  },
};
