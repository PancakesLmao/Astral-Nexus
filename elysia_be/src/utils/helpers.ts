// Response formatting utilities
export const responseUtils = {
  success: (data: any, message: string = "Success") => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }),

  error: (message: string, code: number = 500, details?: any) => ({
    success: false,
    error: {
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
  }),

  paginated: (
    data: any[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ) => ({
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  }),
};

// Date utilities
export const dateUtils = {
  formatISO: (date: Date = new Date()) => date.toISOString(),

  addDays: (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  isExpired: (expiryDate: Date) => new Date() > expiryDate,
};

// String utilities
export const stringUtils = {
  generateId: (length: number = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  slugify: (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },
};
