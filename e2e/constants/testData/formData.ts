export const VALIDATION_MESSAGES = {
    // Email validation
    invalidEmail: "Email address is invalid",
    requiredEmail: "Email address is required",
    
    // Phone validation
    invalidPhone: "Phone number is invalid", 
    requiredPhone: "Phone number is invalid",
};

export const TEST_DATA = {
    // Valid data
    valid: {
        phoneNumber: "4082344567",
        country: "United States", 
        email: "valid.user@example.com"
    },
    
    // Invalid data
    invalid: {
        phoneNumber: "7873458", 
        email: "invalid-email@123",
        emptyString: ""
    }
};