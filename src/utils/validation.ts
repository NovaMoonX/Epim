// Helper function to validate and sanitize URLs
export function validateUrl(url: string) {
  if (!url.trim()) {
    return { valid: true };
  }
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Please enter a valid HTTP or HTTPS URL',
    };
  } catch {
    return {
      valid: false,
      message: 'Please enter a valid URL',
    };
  }
}
