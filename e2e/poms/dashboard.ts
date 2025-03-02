import { Page, expect } from "@playwright/test";
import FormBuilder from "./formBuilder";

export default class Dashboard {
    constructor(private page: Page) {
        this.page = page;
    }

    navigateToFormBuilder = async (): Promise<FormBuilder> => {
        await this.page.getByTestId('add-form-button').click();
        await this.page.getByTestId('start-from-scratch-button').click();

        await expect(this.page.getByTestId('elements-list-title')).toBeVisible({ timeout: 20 * 1000 });
        
        // Return the FormBuilder POM for the page we've now navigated to
        return new FormBuilder(this.page);
    }

    deleteForm = async (email: string) => {
        await this.page.getByTestId('nui-input-field').fill(email);

        await this.page.waitForTimeout(2000);

        const extractFormCount = (text: string): number => {
            if (!text || text.trim().length === 0) return 0;
            return parseInt(text.split(' ')[0]) || 0;
        };

        const formCountText = await this.page.getByTestId('form-count-label').innerText();
        const initialFormCount = extractFormCount(formCountText);

        if (initialFormCount > 0) {
            await this.page.getByRole('checkbox', { name: 'Select all' }).check();
            await this.page.getByTestId('take-action-dropdown-icon').click();
            await this.page.getByTestId('bulk-delete-button').click();
            await this.page.getByTestId('delete-archive-alert-archive-checkbox').check();
            await this.page.getByTestId('delete-archive-alert-delete-button').click();
        }

        await expect(this.page.getByTestId('no-data-container')).toBeVisible();
        const formCountTextAfter = await this.page.getByTestId('form-count-label').innerText();
        const finalFormCount = extractFormCount(formCountTextAfter);
        
        expect(finalFormCount).toBe(0);
    }
}