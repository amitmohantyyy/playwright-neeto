import { Page, Locator, expect } from "@playwright/test";
import { FORM_EDITOR_SELECTORS } from "../constants/selectors";
import { TIMEOUTS } from '../constants/timeouts';

const { FORM_ELEMENTS, BUTTON_NAMES, FIELD_ELEMENTS, OPTION_CONTROLS } = FORM_EDITOR_SELECTORS;

export class FormEditorPage {
    readonly page: Page;
    readonly formTitle: Locator;
    readonly publishButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.formTitle = page.getByTestId(FORM_ELEMENTS.FORM_TITLE);
        this.publishButton = page.getByTestId(FORM_ELEMENTS.PUBLISH_BUTTON);
    }

    async setFormName(formName: string) {
        await this.formTitle.click();
        await this.page.getByTestId(FORM_ELEMENTS.FORM_RENAME_TEXT_FIELD).fill(formName);
        await this.page.getByTestId(FORM_ELEMENTS.FORM_RENAME_SUBMIT_BUTTON).click();
    };

    async addFullNameField() {
        await this.page.getByRole('button', { name: BUTTON_NAMES.FULL_NAME }).click();
    };

    async addPhoneNumberField() {
        await this.page.getByRole('button', { name: BUTTON_NAMES.PHONE_NUMBER }).click();
    }

    async addEmailField() {
        await this.page.getByRole('button', { name: BUTTON_NAMES.EMAIL }).click();
    }

    async addSingleChoiceField(title: string, options: string[]) {
        await this.page.getByRole('button', { name: BUTTON_NAMES.SINGLE_CHOICE }).click();
        await this.page.getByTestId(FIELD_ELEMENTS.ELEMENT_QUESTION_HEADER).waitFor();
        await this.page.getByTestId(FIELD_ELEMENTS.SINGLE_CHOICE_OPTION_CONTAINER).click();
        await this.page.getByTestId(FIELD_ELEMENTS.TEXT_CONTENT_FIELD).fill(title);
        
        await this.page.getByTestId(OPTION_CONTROLS.ADD_BULK_OPTION_BTN).click();
        await this.page.getByTestId(OPTION_CONTROLS.ADD_BULK_OPTION_AREA).fill(options.join(', '));
        await this.page.getByTestId(OPTION_CONTROLS.ADD_BULK_OPTION_DONE_BTN).click();
    }

    async addMultiChoiceField(title: string, optionsCount = 5) {
        await this.page.getByRole('button', { name: BUTTON_NAMES.MULTI_CHOICE }).click();
        await this.page.getByTestId(FIELD_ELEMENTS.ELEMENT_QUESTION_HEADER).waitFor();
        await this.page.getByTestId(FIELD_ELEMENTS.MULTI_CHOICE_OPTION_CONTAINER).click();
        await this.page.getByTestId(FIELD_ELEMENTS.TEXT_CONTENT_FIELD).fill(title);
        
        for (let counter = 0; counter <= optionsCount; counter++) {
          await this.page.getByTestId(OPTION_CONTROLS.ADD_OPTION_BUTTON).click();
        }
    }

    async toggleFieldVisibility(title: string) {
        await this.page.getByText(title).first().click();
        const hideSwitch = this.page.getByTestId(FIELD_ELEMENTS.HIDE_QUESTION_TOGGLE);
        await hideSwitch.scrollIntoViewIfNeeded();
        await hideSwitch.click();
    }

    async publishForm() {
        await this.page.waitForTimeout(TIMEOUTS.UI_ANIMATION);
        await this.publishButton.click();
        
        const previewButton = this.page.getByTestId(FORM_ELEMENTS.PUBLISH_PREVIEW_BUTTON);
        await expect(previewButton).not.toBeDisabled({ timeout: TIMEOUTS.FORM_PUBLISH }); 
        
        return previewButton.getAttribute("href");
    }

    async getSingleChoiceOptions() {
        const singleOptions = await this.page.getByTestId(FIELD_ELEMENTS.SINGLE_CHOICE_OPTION).allInnerTexts();
        return JSON.stringify(singleOptions);
    }
};