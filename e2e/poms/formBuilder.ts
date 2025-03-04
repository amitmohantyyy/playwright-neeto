import { Page, expect } from "@playwright/test";
import { FORMBUILDER_SELECTORS } from "../constants/selectors";
import { FORMBUILDER_API } from "../constants/selectors/formBuilder";

export default class FormBuilder {
    constructor(private page: Page) {
        this.page = page;
    }

    setFormName = async (formName: string) => {
        await this.page.getByTestId(FORMBUILDER_SELECTORS.formTitle).click();
        await this.page.getByTestId(FORMBUILDER_SELECTORS.formRenameTextField).fill(formName);
        await this.page.getByTestId(FORMBUILDER_SELECTORS.formRenameSubmitButton).click();

        await expect(this.page.getByTestId(FORMBUILDER_SELECTORS.formTitle)).toContainText(formName);
    };

    addElement = async (elementName: string) => {
        await this.page.getByRole('button', { name: elementName }).click();
        await expect(this.page.getByTestId(FORMBUILDER_SELECTORS.questionHeader)).toContainText(elementName);
    };

    navigateToSubmissionsTab = async () => {
        await this.page.getByTestId(FORMBUILDER_SELECTORS.submissionsTab).click();
        await expect(this.page.getByTestId(FORMBUILDER_SELECTORS.submissionsCountLabel)).toBeVisible();
    };

    navigateToAnalytics = async () => {
        await this.page.getByTestId(FORMBUILDER_SELECTORS.moreDropdownIcon).click();
        await this.page.getByTestId(FORMBUILDER_SELECTORS.analyticsMoreTab).click();
        await expect(this.page.getByTestId(FORMBUILDER_SELECTORS.submissionsInsightsTitle)).toBeVisible();
    }

    publishForm = async () => await this.page.getByTestId(FORMBUILDER_SELECTORS.publishButton).click();

    returnPublishUrl = async () => {
        const button = this.page.getByTestId(FORMBUILDER_SELECTORS.publishPreviewButton);
        await expect(button).toBeEnabled();
        
        const href = await button.getAttribute('href');
        if (!href) {
            throw new Error('No href attribute found on publish preview button');
        }
        return href;
    };

    //Customise functions
    renameLabel = async (option: string, label: string) => {
        if (option === "Single") {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.singleChoiceOptionsContainer).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.contentTextField).fill(label);
        } else {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.multiChoiceOptionsContainer).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.contentTextField).fill(label);
        }
    };

    addOptions = async (option: string, number: number) => {
        if (option === "Single") {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.singleChoiceOptionsContainer).click();
            for (let i = 0; i < number; i++) {
                await this.page.getByTestId(FORMBUILDER_SELECTORS.addOptionLink).click();
            }
        } else {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.multiChoiceOptionsContainer).click();
            for (let i = 0; i < number; i++) {
                await this.page.getByTestId(FORMBUILDER_SELECTORS.addOptionLink).click();
            }
        }
    }

    addOptionsBulk = async (option: string, choices: string) => {
        if (option === "Single") {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.singleChoiceOptionsContainer).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.addBulkOptionLink).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.bulkAddOptionsTextarea).fill(choices);
            await this.page.getByTestId(FORMBUILDER_SELECTORS.bulkAddOptionsDoneButton).click();
        } else {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.multiChoiceOptionsContainer).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.addBulkOptionLink).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.bulkAddOptionsTextarea).fill(choices);
            await this.page.getByTestId(FORMBUILDER_SELECTORS.bulkAddOptionsDoneButton).click();
        }
    }

    randomizeOptions = async (option: string) => {
        if (option === "Single") {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.singleChoiceOptionsContainer).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.randomizeSwitchLabel).click();
        } else {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.multiChoiceOptionsContainer).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.randomizeSwitchLabel).click();
        }
        await expect(this.page.getByTestId('properties-header').getByTestId('neeto-ui-spinner')).toBeVisible();
        await expect(this.page.getByTestId('properties-header').getByTestId('neeto-ui-spinner')).toBeHidden();
    }

    hideQuestion = async (option: string) => {
        if (option === "Single") {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.singleChoiceOptionsContainer).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.hideQuestionToggleLabel).click();
        } else {
            await this.page.getByTestId(FORMBUILDER_SELECTORS.multiChoiceOptionsContainer).click();
            await this.page.getByTestId(FORMBUILDER_SELECTORS.hideQuestionToggleLabel).click();
        }
        await expect(this.page.getByTestId('properties-header').getByTestId('neeto-ui-spinner')).toBeVisible();
        await expect(this.page.getByTestId('properties-header').getByTestId('neeto-ui-spinner')).toBeHidden();
    }

    waitForPutThenGet = async (urlPattern = FORMBUILDER_API.publishAPI, timeout = 5000) => {
        const waitForMethod = async (method: string) => 
          this.page.waitForResponse(
            res => res.request().method() === method && res.url().startsWith(urlPattern) && res.status() === 200,
            { timeout }
          );
      
        await waitForMethod('PUT');
        return await waitForMethod('GET');
    }
    
    multiOptionVisible = async () => {
        return await this.page.getByTestId(FORMBUILDER_SELECTORS.multiChoiceOptionsContainer).isVisible();
    }
}