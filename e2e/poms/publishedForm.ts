import { Page, expect } from "@playwright/test";
import { PUBLISHED_FORM_SELECTORS } from "../constants/selectors/publishedForm";

export default class PublishedForm {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    initialize(page: Page) {
        this.page = page;
    }

    async getFormFields() {
        return await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.formGroupQuestion).allTextContents();
    }

    async getFormErrors() {
        return await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.formErrorText).allTextContents();
    }

    async formContains(fieldName: string) {
        const fields = await this.getFormFields();
        const containsField = fields.some(text => text.includes(fieldName));
        expect(containsField).toBeTruthy();
    }

    async fillEmail(email: string) {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailTextField).fill(email);
    }

    async fillFullname(name: string) {
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.firstNameTextField).fill(firstName);
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.lastNameTextField).fill(lastName);
    }

    async fillPhoneNumberAndCountry(number: string, country: string) {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.countryCodeDropdown).click();
        const countryCodeContainer = this.page.getByTestId(PUBLISHED_FORM_SELECTORS.phoneNumberDropdownContainer);
        await countryCodeContainer.getByText(new RegExp(country, 'i')).click();

        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.phoneNumberInputField).fill(number);
    }

    async hasSpecificError(errorText: string): Promise<boolean> {
        const errors = await this.getFormErrors();
        return errors.some(error => error.includes(errorText));
    }

    async verifySingleRandomizedOptions(originalOptions: string) {
        const singleOptions = await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.formSingleChoiceOptions).allInnerTexts();
        return JSON.stringify(singleOptions) === JSON.stringify(originalOptions);
    }

    async verifyMultiHidden(): Promise<boolean> {
        return this.page.getByTestId(PUBLISHED_FORM_SELECTORS.formGroupQuestion).filter({ hasText: "Multi Demo" }).isVisible();
    }

    async submitForm() {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.startOrSubmitButton).click();
    }

    async verifySubmission() {
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.thankYouPageMessage)).toContainText("Thank You.");
    }

    async reload(): Promise<void> {
        await this.page.reload();
    }
}
