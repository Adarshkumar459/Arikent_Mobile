export const parseErrorMessage = (err: any): string => {
  if (err?.response?.data) {
    const data = err.response.data;

    // Check for detailed field validation errors array
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const messages = data.errors.map((e: any) => e.message || e.field).filter(Boolean);
      if (messages.length > 0) return messages.join('\n');
    }

    // Check for main API response message string
    if (typeof data.message === 'string' && data.message.trim().length > 0) {
      // Clean up generic status messages
      if (!data.message.includes('Request failed with status code')) {
        return data.message;
      }
    }
  }

  if (typeof err?.message === 'string') {
    if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (!err.message.includes('Request failed with status code')) {
      return err.message;
    }
  }

  return 'An unexpected error occurred. Please try again.';
};
