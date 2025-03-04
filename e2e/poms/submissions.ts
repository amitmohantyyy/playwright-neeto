import { Page, expect } from "@playwright/test";
import Dashboard from "./dashboard";
import { SUBMISSIONS_SELECTORS, NAVIGATION_SELECTORS } from "../constants/selectors";
import { DASHBOARD_LINKS } from "../constants/links/dashboard";

export default class SubmissionsPage {
    constructor(private page: Page) {
        this.page = page;
    }

    searchSubmission = async (email: string) => {
        await this.page.getByTestId(SUBMISSIONS_SELECTORS.searchTextField).fill(email);
        await expect(this.page.getByTestId(SUBMISSIONS_SELECTORS.searchTermBlock)).toBeVisible();
    }

    verifySubmission = async (email: string) => {
        await this.searchSubmission(email);
        const submissionCountText = await this.page.getByTestId(SUBMISSIONS_SELECTORS.countLabel).innerText();
        let countNumber = 0;
        if (submissionCountText && submissionCountText.trim().length > 0) {
            countNumber = parseInt(submissionCountText.split(' ')[0]) || 0;
        }
        expect(countNumber).toBe(1);
    }

    navigateToDashboard = async (): Promise<Dashboard> => {
        await this.page.goto(DASHBOARD_LINKS.activeForms);
        await expect(this.page.getByTestId(NAVIGATION_SELECTORS.mainHeader)).toContainText('Active forms');
        return new Dashboard(this.page);
    }
}