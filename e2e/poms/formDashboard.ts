import { Page, Locator, expect } from "@playwright/test";
import { DASHBOARD_SELECTORS } from "../constants/selectors";
import { LOGIN_CREDENTIALS } from "../constants/values";

const { FORM_ELEMENTS, LOGIN_ELEMENTS, DELETE_ELEMENTS, BUTTON_NAMES } = DASHBOARD_SELECTORS;

export class FormDashboardPage {
    readonly page: Page;
    readonly addFormButton: Locator;
    readonly searchField: Locator;
    readonly formCountLabel: Locator;
    readonly filterBlock: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addFormButton = page.getByTestId(FORM_ELEMENTS.ADD_FORM_BUTTON);
        this.searchField = page.getByTestId(FORM_ELEMENTS.SEARCH_FIELD);
        this.formCountLabel = page.getByTestId(FORM_ELEMENTS.FORM_COUNT_LABEL);
        this.filterBlock = page.getByTestId(FORM_ELEMENTS.FILTER_BLOCK);
    }

    async goto() {
        await this.page.goto('/');
    }

    async login({ email = LOGIN_CREDENTIALS.DEFAULT_USER.EMAIL!, password = LOGIN_CREDENTIALS.DEFAULT_USER.PASSWORD! }: { email: string, password: string }) {
        await this.page.getByTestId(LOGIN_ELEMENTS.EMAIL_FIELD).fill(email);
        await this.page.getByTestId(LOGIN_ELEMENTS.PASSWORD_FIELD).fill(password);
        await this.page.getByTestId(LOGIN_ELEMENTS.SUBMIT_BUTTON).click();
    }

    async createNewForm() {
        await this.addFormButton.click();
        await this.page.getByTestId(FORM_ELEMENTS.START_FROM_SCRATCH_BUTTON).click();
    }

    async searchForm(formName: string) {
        await this.searchField.fill(formName);
        await expect(this.filterBlock).toBeVisible(); //Waits for clear btn to be visible, meaning search is done
    }

    async deleteForm(formName: string) {
        await this.goto()
        await this.searchForm(formName);

        await expect(this.filterBlock).toBeVisible(); 
        const formCountText = await this.formCountLabel.innerText();
    
        let countNumber = 0;

        if (formCountText && formCountText.trim().length > 0) {
            countNumber = parseInt(formCountText.split(' ')[0]) || 0;
        }

        if (countNumber > 0) {
            await this.page.getByRole('checkbox', { name: BUTTON_NAMES.SELECT_ALL }).check();
            await this.page.getByRole('button', { name: BUTTON_NAMES.TAKE_ACTION }).click();
            await this.page.getByRole('button', { name: BUTTON_NAMES.DELETE }).click();
            await this.page.getByTestId(DELETE_ELEMENTS.ARCHIVE_CHECKBOX).check();
            await this.page.getByRole('button', { name: BUTTON_NAMES.DELETE }).click();
        }
    }
};

