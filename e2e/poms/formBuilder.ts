import { Page, expect } from "@playwright/test";
import SubmissionsPage from "./submissions";
import PublishedForm from "./publishedForm";
import Dashboard from "./dashboard";

export default class FormBuilder {
    constructor(private page: Page) {
        this.page = page;
    }

    setFormName = async (formName: string) => {
        await this.page.getByTestId('form-title').click();
        await this.page.getByTestId('form-rename-text-field').fill(formName);
        await this.page.getByTestId('form-rename-submit-button').click();

        await expect(this.page.getByTestId('form-title')).toContainText(formName);
    };

    addElement = async (elementName: string) => {
        await this.page.getByRole('button', { name: elementName }).click();
        await expect(this.page.getByTestId('question-header')).toContainText(elementName);
    };

    navigateToSubmissionsTab = async (): Promise<SubmissionsPage> => {
        await this.page.getByTestId('submissions-tab').click();
        await expect(this.page.getByTestId('submissions-count-label')).toBeVisible();
        
        // Return the SubmissionsPage POM for the tab we've now navigated to
        return new SubmissionsPage(this.page);
    };

    navigateToDashboard = async (): Promise<Dashboard> => {
        await this.page.goto('/admin/dashboard/active');
        await this.page.getByTestId('main-header').click();
        await expect(this.page.getByTestId('main-header')).toContainText('Active forms');
        return new Dashboard(this.page);
    }

    publishForm = async () => await this.page.getByTestId('publish-button').click();

    returnPublishedFormUrl = async (): Promise<string> => {
        const button = this.page.getByTestId('publish-preview-button');
        let isDisabled = await button.isDisabled();
        
        if (isDisabled) {
            await this.page.waitForTimeout(5000);
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
    };

    openPublishedForm = async (browser: any): Promise<PublishedForm> => {
        const url = await this.returnPublishedFormUrl();
        const context = await browser.newContext();
        const newPage = await context.newPage();
        await newPage.goto(url);
        return new PublishedForm(newPage, context);
    };

    //Customise functions
    renameLabel = async (option: string, label: string) => {
        if (option === "Single") {
            await this.page.getByTestId('single-choice-options-container').click();
            await this.page.getByTestId('content-text-field').fill(label);
        } else {
            await this.page.getByTestId('multi-choice-options-container').click();
            await this.page.getByTestId('content-text-field').fill(label);
        }
    };

    addOptions = async (option: string, number: number) => {
        if (option === "Single") {
            await this.page.getByTestId('single-choice-options-container').click();
            for (let i = 0; i < number; i++) {
                await this.page.getByTestId('add-option-link').click();
            }
        } else {
            await this.page.getByTestId('multi-choice-options-container').click();
            for (let i = 0; i < number; i++) {
                await this.page.getByTestId('add-option-link').click();
            }
        }
    }

    addOptionsBulk = async (option: string, choices: string) => {
        if (option === "Single") {
            await this.page.getByTestId('single-choice-options-container').click();
            await this.page.getByTestId('add-bulk-option-link').click();
            await this.page.getByTestId('bulk-add-options-textarea').fill(choices);
            await this.page.getByTestId('bulk-add-options-done-button').click();
        } else {
            await this.page.getByTestId('multi-choice-options-container').click();
            await this.page.getByTestId('add-bulk-option-link').click();
            await this.page.getByTestId('bulk-add-options-textarea').fill(choices);
            await this.page.getByTestId('bulk-add-options-done-button').click();
        }
    }

    randomizeOptions = async (option: string) => {
        if (option === "Single") {
            await this.page.getByTestId('single-choice-options-container').click();
            await this.page.getByTestId('randomize-switch-label').click();
        } else {
            await this.page.getByTestId('multi-choice-options-container').click();
            await this.page.getByTestId('randomize-switch-label').click();
        }
        await this.page.waitForTimeout(1000);
    }

    hideQuestion = async (option: string) => {
        if (option === "Single") {
            await this.page.getByTestId('single-choice-options-container').click();
            await this.page.getByTestId('hide-question-toggle-label').click();
        } else {
            await this.page.getByTestId('multi-choice-options-container').click();
            await this.page.getByTestId('hide-question-toggle-label').click();
        }
        await this.page.waitForTimeout(1000);
    }

    async waitForPutThenGet(urlPattern = 'https://neeto-form-web-playwright.neetodeployapp.com/api/v1/forms/', timeout = 5000) {
        const waitForMethod = async (method: string) => 
          this.page.waitForResponse(
            res => res.request().method() === method && res.url().startsWith(urlPattern) && res.status() === 200,
            { timeout }
          );
      
        await waitForMethod('PUT');
        return await waitForMethod('GET');
        }
    
    multiOptionVisible = async () => {
        return await this.page.getByTestId('multi-choice-options-container').isVisible();
    }     
}