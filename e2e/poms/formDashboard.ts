import { Page, Locator, expect } from "@playwright/test";

export class FormDashboardPage {
    readonly page: Page;
    readonly addFormButton: Locator;
    readonly searchField: Locator;
    readonly formCountLabel: Locator;
    readonly clearFilterButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addFormButton = page.getByTestId('add-form-button');
        this.searchField = page.getByTestId('nui-input-field');
        this.formCountLabel = page.getByTestId('form-count-label');
        this.clearFilterButton = page.getByTestId('neeto-filters-search-term-block');
    }

    async goto() {
        await this.page.goto('/');
    }

    async login({ email = "oliver@example.com", password = "welcome" }: { email: string, password: string }) {
        await this.page.getByTestId('login-email-text-field').fill(email);
        await this.page.getByTestId('login-password-text-field').fill(password);
        await this.page.getByTestId('login-submit-button').click();
    }

    async createNewForm() {
        await this.addFormButton.click();
        await this.page.getByTestId('start-from-scratch-button').click();
    }

    async searchForm(formName: string) {
        await this.searchField.fill(formName);
        await expect(this.clearFilterButton).toBeVisible(); //Waits for clear btn to be visible, meaning search is done
    }

    async deleteForm(formName: string) {
        await this.goto()
        await this.searchForm(formName);

        await expect(this.clearFilterButton).toBeVisible(); 
        const formCountText = await this.formCountLabel.innerText();
    
        let countNumber = 0;

        if (formCountText && formCountText.trim().length > 0) {
            countNumber = parseInt(formCountText.split(' ')[0]) || 0;
        }

        if (countNumber > 0) {
            await this.page.getByRole('checkbox', { name: 'Select all' }).check();
            await this.page.getByRole('button', { name: 'Take action' }).click();
            await this.page.getByRole('button', { name: 'Delete' }).click();
            await this.page.getByTestId('delete-archive-alert-archive-checkbox').check();
            await this.page.getByRole('button', { name: 'Delete' }).click();
        }
    }

};

