/**
 * Client-side error logging utility
 * Captures errors, stores in localStorage, and sends to server for persistence
 */

/**
 * Detects if the browser is Brave
 */
export function detectBrave() {
  return (
    navigator.brave !== undefined && navigator.brave.isBrave.name === "isBrave"
  );
}

/**
 * Gets device and browser information
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    isBrave: detectBrave(),
    connectionType: navigator?.connection?.effectiveType || "unknown",
  };
}

/**
 * Main error logging function
 * @param {Object} errorData - Error information
 * @param {Error} errorData.error - The error object
 * @param {string} errorData.context - Where the error occurred (e.g., "chat-send", "stream-parse")
 * @param {Object} errorData.metadata - Additional context (request payload, response status, etc.)
 */
export async function logError({ error, context, metadata = {} }) {
  const timestamp = new Date().toISOString();
  const deviceInfo = getDeviceInfo();

  const errorLog = {
    timestamp,
    context,
    error: {
      name: error?.name || "Unknown",
      message: error?.message || "Unknown error",
      stack: error?.stack || null,
    },
    deviceInfo,
    metadata,
    url: window.location.href,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.group(`🔴 Error Log: ${context}`);
    console.error("Error:", error);
    console.log("Device Info:", deviceInfo);
    console.log("Metadata:", metadata);
    console.groupEnd();
  }

  // Store in localStorage as backup
  try {
    const existingLogs = JSON.parse(
      localStorage.getItem("errorLogs") || "[]",
    ).slice(-9); // Keep last 9
    existingLogs.push(errorLog);
    localStorage.setItem("errorLogs", JSON.stringify(existingLogs));
  } catch (e) {
    console.warn("Failed to save error to localStorage:", e);
  }

  // Send to server (non-blocking)
  try {
    await fetch("/api/error-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorLog),
    });
  } catch (e) {
    console.warn("Failed to send error to server:", e);
    // Silent fail - don't throw errors from error logger
  }

  return errorLog;
}

/**
 * Get all errors from localStorage
 */
export function getStoredErrors() {
  try {
    return JSON.parse(localStorage.getItem("errorLogs") || "[]");
  } catch (e) {
    console.warn("Failed to retrieve errors from localStorage:", e);
    return [];
  }
}

/**
 * Clear stored errors from localStorage
 */
export function clearStoredErrors() {
  try {
    localStorage.removeItem("errorLogs");
    return true;
  } catch (e) {
    console.warn("Failed to clear errors from localStorage:", e);
    return false;
  }
}
