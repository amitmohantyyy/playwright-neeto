import { Page, expect, BrowserContext } from "@playwright/test";

export default class PublishedForm {
    private context?: BrowserContext;

    constructor(private page: Page, context?: BrowserContext) {
        this.page = page;
        this.context = context;
    }

    getFormFields = async () =>  {
        return await this.page.getByTestId('form-group-question').allTextContents();
    }

    getFormErrors = async () => {
        return await this.page.getByTestId('form-error-text').allTextContents();
    }

    formContains = async (fieldName: string) => {
        const fields = await this.getFormFields();
        const containsField = fields.some(text => text.includes(fieldName));

        expect(containsField).toBeTruthy();
    }

    fillEmail = async (email: string) => {
        await this.page.getByTestId('email-text-field').fill(email);
    }

    fillFullname = async (name: string) => {
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        await this.page.getByTestId('first-name-text-field').fill(firstName);
        await this.page.getByTestId('last-name-text-field').fill(lastName);
    }
    
    fillPhoneNumberAndCountry = async (number: string, country: string) => {

        await this.page.getByTestId('country-code-dropdown').click();
        const countryCodeContainer = this.page.getByTestId('phone-number-dropdown-container');
        await countryCodeContainer.getByText(new RegExp(country, 'i')).click();

        await this.page.getByTestId('phone-number-input-field').fill(number);
    }

    hasSpecificError = async (errorText: string): Promise<boolean> => {
        const errors = await this.getFormErrors();
        return errors.some(error => error.includes(errorText));
    }

    submitForm = async () => {
        await this.page.getByTestId('start-or-submit-button').click();
    }

    close = async () => {
        if (this.context) {
            await this.context.close();
        }
    }

    verifySubmission = async () => {
        await expect(this.page.getByTestId('thank-you-page-message')).toContainText("Thank You.");
    }
}