import { Page, expect } from "@playwright/test";
import SubmissionsPage from "./submissions";
import PublishedForm from "./publishedForm";

export default class FormBuilder {
    constructor(private page: Page) {
        this.page = page;
    }

    setFormName = async (formName: string) => {
        await this.page.getByTestId('form-title').click();
        await this.page.getByTestId('form-rename-text-field').fill(formName);
        await this.page.getByTestId('form-rename-submit-button').click();

        await expect(this.page.getByTestId('form-title')).toContainText(formName);
    }

    addElement = async (elementName: string) => {
        await this.page.getByRole('button', { name: elementName }).click();
        await expect(this.page.getByTestId('question-header')).toContainText(elementName);
    }

    navigateToSubmissionsTab = async (): Promise<SubmissionsPage> => {
        await this.page.getByTestId('submissions-tab').click();
        await expect(this.page.getByTestId('submissions-count-label')).toBeVisible();
        
        // Return the SubmissionsPage POM for the tab we've now navigated to
        return new SubmissionsPage(this.page);
    }

    publishForm = async () => await this.page.getByTestId('publish-button').click();

    returnPublishedFormUrl = async (): Promise<string> => {
        const button = this.page.getByTestId('publish-preview-button');
        let isDisabled = await button.isDisabled();
        
        if (isDisabled) {
            await this.page.waitForTimeout(3000);
            isDisabled = await button.isDisabled();
            
            if (isDisabled) {
                throw new Error('Publish preview button is still disabled after waiting');
            }
        }
        
        const href = await button.getAttribute('href');
        if (!href) {
            throw new Error('No href attribute found on publish preview button');
        }
        return href;
    }

    openPublishedForm = async (browser: any): Promise<PublishedForm> => {
        const url = await this.returnPublishedFormUrl();
        const context = await browser.newContext();
        const newPage = await context.newPage();
        await newPage.goto(url);
        return new PublishedForm(newPage, context);
    }
}