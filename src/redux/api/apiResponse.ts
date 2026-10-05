export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  errors?: string[];
  data?: T;
}
