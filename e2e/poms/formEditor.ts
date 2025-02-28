import { Page, Locator, expect } from "@playwright/test";

export class FormEditorPage {
    readonly page: Page;
    readonly formTitle: Locator;
    readonly publishButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.formTitle = page.getByTestId('form-title');
        this.publishButton = page.getByTestId('publish-button');
    }

    async setFormName(formName: string) {
        await this.formTitle.click();
        await this.page.getByTestId('form-rename-text-field').fill(formName);
        await this.page.getByTestId('form-rename-submit-button').click();
    };

    async addFullNameField() {
        await this.page.getByRole('button', { name: 'Full name' }).click();
    };

    async addPhoneNumberField() {
        await this.page.getByRole('button', { name: 'Phone number' }).click();
    }

    async addEmailField() {
        await this.page.getByRole('button', { name: 'Email' }).click();
    }

    async addSingleChoiceField(title: string, options: string[]) {
        await this.page.getByRole('button', { name: 'Single choice' }).click();
        await this.page.getByTestId('question-header').waitFor();
        await this.page.getByTestId('single-choice-options-container').click();
        await this.page.getByTestId('content-text-field').fill(title);
        
        await this.page.getByTestId('add-bulk-option-link').click();
        await this.page.getByTestId('bulk-add-options-textarea').fill(options.join(', '));
        await this.page.getByTestId('bulk-add-options-done-button').click();
    }

    async addMultiChoiceField(title: string, optionsCount = 5) {
        await this.page.getByRole('button', { name: 'Multi choice' }).click();
        await this.page.getByTestId('question-header').waitFor();
        await this.page.getByTestId('multi-choice-options-container').click();
        await this.page.getByTestId('content-text-field').fill(title);
        
        for (let counter = 0; counter <= optionsCount; counter++) {
          await this.page.getByTestId('add-option-link').click();
        }
    }

    async toggleFieldVisibility(title: string) {
        await this.page.getByText(title).first().click();
        const hideSwitch = this.page.getByTestId('hide-question-toggle-label');
        await hideSwitch.scrollIntoViewIfNeeded();
        await hideSwitch.click();
    }

    async publishForm() {
        await this.page.waitForTimeout(1000);
        await this.publishButton.click();
        
        const previewButton = this.page.getByTestId("publish-preview-button");
        await expect(previewButton).not.toBeDisabled({ timeout: 30000 }); //Wait for the button to not have property 'disabled'
        
        return previewButton.getAttribute("href");
    }

    async getSingleChoiceOptions() {
        const singleOptions = await this.page.getByTestId('single-choice-option').allInnerTexts();
        return JSON.stringify(singleOptions);
    }
};