import { Page, expect } from "@playwright/test";
import { ANALYTICS_SELECTORS } from "../constants/selectors";

export default class AnalyticsPage {
    constructor(private page: Page) {
        this.page = page;
    }

    getVisits = async (): Promise<number> => {
        await this.page.reload();
        await expect(this.page.getByTestId(ANALYTICS_SELECTORS.insightsPanel)).toBeVisible();
        const visitText = await this.page.getByTestId(ANALYTICS_SELECTORS.visitsMetric)
            .getByTestId(ANALYTICS_SELECTORS.insightsCount).textContent();
        return parseInt(visitText || '0');
    };

    getStarts = async (): Promise<number> => {
        await this.page.reload();
        await expect(this.page.getByTestId(ANALYTICS_SELECTORS.insightsPanel)).toBeVisible();
        const startsText = await this.page.getByTestId(ANALYTICS_SELECTORS.startsMetric)
            .getByTestId(ANALYTICS_SELECTORS.insightsCount).textContent();
        return parseInt(startsText || '0');
    };

    getSubmissions = async (): Promise<number> => {
        await this.page.reload();
        await expect(this.page.getByTestId(ANALYTICS_SELECTORS.insightsPanel)).toBeVisible();
        const submissionsText = await this.page.getByTestId(ANALYTICS_SELECTORS.submissionsMetric)
            .getByTestId(ANALYTICS_SELECTORS.insightsCount).textContent();
        return parseInt(submissionsText || '0');
    };
}