import { Page, expect } from "@playwright/test";
import Dashboard from "./dashboard";

export default class SubmissionsPage {
    constructor(private page: Page) {
        this.page = page;
    }

    searchSubmission = async (email: string) => {
        await this.page.getByTestId('submissions-search-text-field').fill(email);
        await expect(this.page.getByTestId('neeto-filters-search-term-block')).toBeVisible();
    }

    verifySubmission = async (email: string) => {
        await this.searchSubmission(email);
        const submissionCountText = await this.page.getByTestId('submissions-count-label').innerText();
        let countNumber = 0;
        if (submissionCountText && submissionCountText.trim().length > 0) {
            countNumber = parseInt(submissionCountText.split(' ')[0]) || 0;
        }
        expect(countNumber).toBe(1);
    }

    navigateToDashboard = async (): Promise<Dashboard> => {
        await this.page.goto('/admin/dashboard/active');
        await this.page.getByTestId('main-header').click();
        await expect(this.page.getByTestId('main-header')).toContainText('Active forms');
        return new Dashboard(this.page);
    }
}