import { Page, Locator, expect } from "@playwright/test";

export class AnalyticsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.page.getByTestId('more-dropdown-icon').click();
        await this.page.getByTestId('analytics-more-tab').click();
        await this.page.reload();
    }

    async getMetrics() {
        const visits = await this.page.getByTestId('visits-metric').getByTestId('insights-count').innerText();
        const starts = await this.page.getByTestId('starts-metric').getByTestId('insights-count').innerText();
        const submissions = await this.page.getByTestId('submissions-metric').getByTestId('insights-count').innerText();
        const completion = await this.page.getByTestId('completion-rate-metric').getByTestId('insights-count').innerText();
        
        return { visits, starts, submissions, completion };
    }

    async expectMetrics(expectedMetrics: { visits?: string, starts?: string, submissions?: string, completion?: string }) {
        const metrics = await this.getMetrics();
        
        if (expectedMetrics.visits !== undefined) {
          expect(metrics.visits).toBe(expectedMetrics.visits);
        }
        
        if (expectedMetrics.starts !== undefined) {
          expect(metrics.starts).toBe(expectedMetrics.starts);
        }
        
        if (expectedMetrics.submissions !== undefined) {
          expect(metrics.submissions).toBe(expectedMetrics.submissions);
        }
        
        if (expectedMetrics.completion !== undefined) {
          expect(metrics.completion).toBe(expectedMetrics.completion);
        }
    }
}
