export const TIMEOUTS = {
    // Navigation and page operations
    SHORT: 1000,       // 1 second - for small UI interactions
    MEDIUM: 5000,      // 5 seconds - for standard operations
    LONG: 30000,       // 30 seconds - for longer operations like publishing

    // Specific operations
    FORM_PUBLISH: 30000,          // Waiting for publish preview button to be enabled
    SUBMISSION_RESULTS: 5000,     // Waiting for search results in submissions tab
    UI_ANIMATION: 1000,           // Small timeout for UI animations/transitions
};