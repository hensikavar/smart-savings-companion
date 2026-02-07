import { getAccessToken } from '@/lib/api';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = 'http://localhost:8000/api';

export interface UploadPdfResponse {
  uploadedFileName: string;
  extractedTransactionsCount: number;
  createdExpensesCount: number;
  totalAmount: number;
  reportUrl: string | null;
  expenseIds: string[];
}

export interface ReportSummary {
  totalExpenses: number;
  monthlyGoal: number;
  savingsLeft: number;
  spendingPercentage: number;
  reportPeriod: string;
}

export interface TopCategory {
  name: string;
  amount: number;
  percentage: number;
}

export interface GenerateReportResponse {
  reportPdfUrl: string;
  summary: ReportSummary;
  topCategories: TopCategory[];
}

export const transactionService = {
  /**
   * Upload a transaction PDF for automatic expense extraction
   */
  uploadPdf: async (file: File): Promise<ApiResponse<UploadPdfResponse>> => {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/transactions/upload-pdf`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Failed to upload PDF');
      (error as any).response = data;
      (error as any).status = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Generate a financial report for a given date range
   */
  generateReport: async (startDate: string, endDate: string): Promise<ApiResponse<GenerateReportResponse>> => {
    return api.get<ApiResponse<GenerateReportResponse>>(
      `/transactions/generate-report?startDate=${startDate}&endDate=${endDate}`,
      true
    );
  },

  /**
   * Get the download URL for a report PDF
   */
  getReportDownloadUrl: (reportPdfUrl: string): string => {
    return `${API_BASE_URL.replace('/api', '')}${reportPdfUrl}`;
  },
};
