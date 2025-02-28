import { Page, Locator, expect } from "@playwright/test";

export class PublishedFormPage {
    readonly page: Page;
    readonly emailField: Locator;
    readonly phoneField: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailField = page.getByTestId('email-text-field');
        this.phoneField = page.getByTestId('phone-number-input-field');
        this.submitButton = page.getByTestId('start-or-submi-button');
    }

    async goto(url: string) {
        await this.page.goto(url);
    }
    
    async fillEmail(email: string) {
        await this.emailField.fill(email);
    }

    async fillPhoneNumber(number: string) {
        await this.phoneField.fill(number);
    }

    async fillName(firstName: string, lastName: string) {
        await this.page.getByTestId('first-name-text-field').fill(firstName);
        await this.page.getByTestId('last-name-text-field').fill(lastName);
    }

    async selectCountryCode(country: string = 'United States') {
        await this.page.getByTestId('country-code-dropdown').click();
        const countryCodeContainer = this.page.getByTestId('phone-number-dropdown-container');
        await countryCodeContainer.getByText(new RegExp(country, 'i')).click();
    }

    async submit() {
        await this.submitButton.click();
    }

    async verifyThankYou() {
        await expect(this.page.getByTestId('thank-you-page-message')).toContainText('Thank You');
    }

    async getSingleChoiceOptions() {
        const singleOptions = await this.page.getByTestId('single-choice-option').allInnerTexts();
        return JSON.stringify(singleOptions);
    }
}