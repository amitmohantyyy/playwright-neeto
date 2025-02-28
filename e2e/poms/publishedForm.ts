import { Page, Locator, expect } from "@playwright/test";
import { PUBLISHED_FORM_SELECTORS } from "../constants/selectors";

const { FORM_ELEMENTS, DROPDOWN_ELEMENTS, RESULT_ELEMENTS } = PUBLISHED_FORM_SELECTORS;

export class PublishedFormPage {
    readonly page: Page;
    readonly emailField: Locator;
    readonly phoneField: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailField = page.getByTestId(FORM_ELEMENTS.EMAIL_FIELD);
        this.phoneField = page.getByTestId(FORM_ELEMENTS.PHONE_NUMBER_FIELD);
        this.submitButton = page.getByTestId(FORM_ELEMENTS.SUBMIT_BUTTON);
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
        await this.page.getByTestId(FORM_ELEMENTS.FIRST_NAME_FIELD).fill(firstName);
        await this.page.getByTestId(FORM_ELEMENTS.LAST_NAME_FIELD).fill(lastName);
    }

    async selectCountryCode(country: string = 'United States') {
        await this.page.getByTestId(DROPDOWN_ELEMENTS.COUNTRY_CODE).click();
        const countryCodeContainer = this.page.getByTestId(DROPDOWN_ELEMENTS.DROPDOWN_CONTAINER);
        await countryCodeContainer.getByText(new RegExp(country, 'i')).click();
    }

    async submit() {
        await this.submitButton.click();
    }

    async verifyThankYou() {
        await expect(this.page.getByTestId(RESULT_ELEMENTS.THANK_YOU_MESSAGE)).toContainText('Thank You');
    }

    async getSingleChoiceOptions() {
        const singleOptions = await this.page.getByTestId(RESULT_ELEMENTS.SINGLE_CHOICE_OPTION).allInnerTexts();
        return JSON.stringify(singleOptions);
    }
}