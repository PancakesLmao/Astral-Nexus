// JWT utility functions (mock implementation)
export const jwtUtils = {
  sign: (payload: any, secret: string, expiresIn: string = "24h") => {
    // Mock JWT signing - replace with actual JWT library
    return `mock.jwt.token.${btoa(JSON.stringify(payload))}`;
  },

  verify: (token: string, secret: string) => {
    // Mock JWT verification - replace with actual JWT library
    try {
      const payload = token.split(".")[3];
      return JSON.parse(atob(payload));
    } catch {
      throw new Error("Invalid token");
    }
  },

  decode: (token: string) => {
    // Mock JWT decode - replace with actual JWT library
    try {
      const payload = token.split(".")[3];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },
};

// Password hashing utilities (mock implementation)
export const passwordUtils = {
  hash: async (password: string): Promise<string> => {
    // Mock password hashing - replace with bcrypt or similar
    return `hashed_${password}_${Date.now()}`;
  },

  verify: async (password: string, hash: string): Promise<boolean> => {
    // Mock password verification - replace with bcrypt or similar
    return hash.includes(password);
  },
};

// Validation utilities
export const validationUtils = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isStrongPassword: (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  },

  sanitizeInput: (input: string): string => {
    return input.trim().replace(/[<>]/g, "");
  },
};
