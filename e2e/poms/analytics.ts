import { Page, expect } from "@playwright/test";
import Dashboard from "./dashboard";

export default class AnalyticsPage {
    constructor(private page: Page) {
        this.page = page;
    }

    navigateToDashboard = async (): Promise<Dashboard> => {
        await this.page.goto('/admin/dashboard/active');
        await expect(this.page.getByTestId('main-header')).toBeVisible();
        await expect(this.page.getByTestId('main-header')).toContainText('Active forms');
        return new Dashboard(this.page);
    };

    getVisits = async (): Promise<number> => {
        await this.page.reload();
        await expect(this.page.getByTestId('insights')).toBeVisible();
        const visitText = await this.page.getByTestId('visits-metric').getByTestId('insights-count').textContent();
        return parseInt(visitText || '0');
    };

    getStarts = async (): Promise<number> => {
        await this.page.reload();
        await expect(this.page.getByTestId('insights')).toBeVisible();
        const startsText = await this.page.getByTestId('starts-metric').getByTestId('insights-count').textContent();
        return parseInt(startsText || '0');
    };

    getSubmissions = async (): Promise<number> => {
        await this.page.reload();
        await expect(this.page.getByTestId('insights')).toBeVisible();
        const submissionsText = await this.page.getByTestId('submissions-metric').getByTestId('insights-count').textContent();
        return parseInt(submissionsText || '0');
    };
}