import { Page, Locator, expect } from "@playwright/test";
import { ANALYTICS_SELECTORS } from "../constants/selectors";

const { NAV_ELEMENTS, METRIC_ELEMENTS } = ANALYTICS_SELECTORS;

export class AnalyticsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.page.getByTestId(NAV_ELEMENTS.MORE_DROPDOWN).click();
        await this.page.getByTestId(NAV_ELEMENTS.ANALYTICS_TAB).click();
        await this.page.reload();
    }

    async getMetrics() {
        const visits = await this.page.getByTestId(METRIC_ELEMENTS.VISITS).getByTestId(METRIC_ELEMENTS.INSIGHTS_COUNT).innerText();
        const starts = await this.page.getByTestId(METRIC_ELEMENTS.STARTS).getByTestId(METRIC_ELEMENTS.INSIGHTS_COUNT).innerText();
        const submissions = await this.page.getByTestId(METRIC_ELEMENTS.SUBMISSIONS).getByTestId(METRIC_ELEMENTS.INSIGHTS_COUNT).innerText();
        const completion = await this.page.getByTestId(METRIC_ELEMENTS.COMPLETION_RATE).getByTestId(METRIC_ELEMENTS.INSIGHTS_COUNT).innerText();
        
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
