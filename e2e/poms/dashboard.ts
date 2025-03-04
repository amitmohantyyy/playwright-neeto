import { Page, expect } from "@playwright/test";
import { DASHBOARD_SELECTORS } from "../constants/selectors";
import { DASHBOARD_LINKS } from "../constants/links/dashboard";

export default class Dashboard {
    constructor(private page: Page) {
        this.page = page;
    }

    navigateToFormBuilder = async () => {
        await this.page.getByTestId(DASHBOARD_SELECTORS.addFormButton).click();
        await this.page.getByTestId(DASHBOARD_SELECTORS.startFromScratchButton).click();
        await expect(this.page.getByTestId(DASHBOARD_SELECTORS.elementsListTitle)).toBeVisible({ timeout: 20 * 1000 });
    }

    deleteForm = async (formName: string) => {
        await this.page.goto(DASHBOARD_LINKS.activeForms);
        await this.page.getByTestId(DASHBOARD_SELECTORS.inputField).fill(formName);

        const extractFormCount = (text: string): number => {
            if (!text || text.trim().length === 0) return 0;
            return parseInt(text.split(' ')[0]) || 0;
        };

        await expect(this.page.getByTestId(DASHBOARD_SELECTORS.formCountLabel)).toContainText('form');

        const formCountText = await this.page.getByTestId(DASHBOARD_SELECTORS.formCountLabel).innerText();
        const initialFormCount = extractFormCount(formCountText);

        if (initialFormCount > 0) {
            await this.page.getByRole('checkbox', { name: DASHBOARD_SELECTORS.selectAllCheckbox }).check();
            await this.page.getByTestId(DASHBOARD_SELECTORS.takeActionDropdownIcon).click();
            await this.page.getByTestId(DASHBOARD_SELECTORS.bulkDeleteButton).click();
            await this.page.getByTestId(DASHBOARD_SELECTORS.deleteArchiveAlertArchiveCheckbox).check();
            await this.page.getByTestId(DASHBOARD_SELECTORS.deleteArchiveAlertDeleteButton).click();
        }

        await expect(this.page.getByTestId(DASHBOARD_SELECTORS.noDataContainer)).toBeVisible();
        const formCountTextAfter = await this.page.getByTestId(DASHBOARD_SELECTORS.formCountLabel).innerText();
        const finalFormCount = extractFormCount(formCountTextAfter);
        
        expect(finalFormCount).toBe(0);
    }
}