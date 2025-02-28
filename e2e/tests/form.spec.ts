import { test } from '../fixtures/formFixture';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { FORM_TEST_SELECTORS } from '../constants/selectors';
import { FORM_TEXTS } from '../constants/texts';
import { CHOICE_OPTIONS } from '../constants/values';
import { TIMEOUTS } from '../constants/index';

const { PUBLISHED_FORM, FORM_EDITOR, SUBMISSIONS } = FORM_TEST_SELECTORS;
const { FIELD_TITLES, ERROR_MESSAGES, SUCCESS_MESSAGES, COUNTRIES, INPUT_VALUES } = FORM_TEXTS;

test.describe("Form", () => {
    let email: string;
    let formName: string;
    let fullName: string;

    test.beforeEach(async () => {
        email = faker.internet.email();
        formName = faker.word.words({ count: 2 });
        fullName = faker.person.fullName();
    });

    test.afterEach(async ({ formDashboard }) => {
        await formDashboard.deleteForm(formName);
    });

    test("add and publish a new form with email and phone number", async ({ 
        formDashboard,
        formEditor,
        page
    }) => {
        await formDashboard.createNewForm();
        await formEditor.addFullNameField();
        await formEditor.addPhoneNumberField();

        await formEditor.setFormName(formName);
        await page.waitForTimeout(TIMEOUTS.UI_ANIMATION);
        const publishUrl = await formEditor.publishForm();
        expect(publishUrl).toBeTruthy();
        
        const publishedPage = await page.context().newPage();
        await publishedPage.goto(publishUrl!);
        
        await expect(publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.PHONE_NUMBER)).toBeVisible();
        await expect(publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.EMAIL)).toBeVisible();
        
        await publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.EMAIL).fill(INPUT_VALUES.BLANK_SPACE);
        await publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.PHONE_NUMBER).fill(INPUT_VALUES.BLANK_SPACE);
        await publishedPage.getByTestId(PUBLISHED_FORM.BUTTONS.SUBMIT).click();
        await expect(publishedPage.getByTestId(PUBLISHED_FORM.GROUPS.PHONE_GROUP).getByTestId(PUBLISHED_FORM.FEEDBACK.FORM_ERROR_TEXT)).toContainText(ERROR_MESSAGES.PHONE_NUMBER_INVALID);
        await expect(publishedPage.getByTestId(PUBLISHED_FORM.GROUPS.EMAIL_GROUP).getByTestId(PUBLISHED_FORM.FEEDBACK.FORM_ERROR_TEXT)).toContainText(ERROR_MESSAGES.EMAIL_REQUIRED);
        
        await publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.EMAIL).fill(INPUT_VALUES.INVALID_EMAIL);
        await publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.PHONE_NUMBER).fill(INPUT_VALUES.INVALID_PHONE);
        await publishedPage.getByTestId(PUBLISHED_FORM.BUTTONS.SUBMIT).click();
        await expect(publishedPage.getByTestId(PUBLISHED_FORM.GROUPS.PHONE_GROUP).getByTestId(PUBLISHED_FORM.FEEDBACK.FORM_ERROR_TEXT)).toContainText(ERROR_MESSAGES.PHONE_NUMBER_INVALID);
        await expect(publishedPage.getByTestId(PUBLISHED_FORM.GROUPS.EMAIL_GROUP).getByTestId(PUBLISHED_FORM.FEEDBACK.FORM_ERROR_TEXT)).toContainText(ERROR_MESSAGES.EMAIL_INVALID);
        
        await publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.EMAIL).fill(email);
        await publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.FIRST_NAME).fill(fullName.split(' ')[0]);
        await publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.LAST_NAME).fill(fullName.split(' ')[1]);
        await publishedPage.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.PHONE_NUMBER).fill(INPUT_VALUES.VALID_PHONE);
        await publishedPage.getByTestId(PUBLISHED_FORM.DROPDOWNS.COUNTRY_CODE).click();
        
        const countryCodeContainer = publishedPage.getByTestId(PUBLISHED_FORM.DROPDOWNS.COUNTRY_CODE_CONTAINER);
        await countryCodeContainer.getByText(new RegExp(COUNTRIES.UNITED_STATES, 'i')).click();
        
        await publishedPage.getByTestId(PUBLISHED_FORM.BUTTONS.SUBMIT).click();
        
        await expect(publishedPage.getByTestId(PUBLISHED_FORM.FEEDBACK.THANK_YOU_MESSAGE)).toContainText(SUCCESS_MESSAGES.THANK_YOU);
        
        await page.getByTestId(SUBMISSIONS.TAB).click();
        await page.getByTestId(SUBMISSIONS.SEARCH_FIELD).fill(email);
        await page.getByTestId(SUBMISSIONS.COUNT_LABEL).waitFor({ state: 'visible', timeout: TIMEOUTS.SUBMISSION_RESULTS });
        
        const submissionCountText = await page.getByTestId(SUBMISSIONS.COUNT_LABEL).innerText();
        let countNumber = 0;
        if (submissionCountText && submissionCountText.trim().length > 0) {
            countNumber = parseInt(submissionCountText.split(' ')[0]) || 0;
        }
        expect(countNumber).toBe(1);
        
        await publishedPage.close();
    });
    
    test("Customize form field elements", async ({ 
        formDashboard,
        formEditor,
        simulateUser,
        page
    }) => {
        const spinner = page.getByTestId(FORM_EDITOR.UI_ELEMENTS.SPINNER);
        
        await formDashboard.createNewForm();
        await formEditor.setFormName(formName);
        
        await formEditor.addSingleChoiceField(FIELD_TITLES.SINGLE_CHOICE_DEMO, CHOICE_OPTIONS.SINGLE_CHOICE);
        await page.getByTestId(FORM_EDITOR.UI_ELEMENTS.RANDOMIZE_SWITCH).click();
        
        const originalOptionTexts = await formEditor.getSingleChoiceOptions();
        
        await formEditor.addMultiChoiceField(FIELD_TITLES.MULTI_CHOICE_DEMO, CHOICE_OPTIONS.MULTI_CHOICE_NUMBER);
        
        const hideSwitch = page.getByTestId(FORM_EDITOR.UI_ELEMENTS.HIDE_QUESTION_TOGGLE);
        await hideSwitch.scrollIntoViewIfNeeded();
        await hideSwitch.click();
        
        await expect(spinner).toBeVisible();
        await expect(spinner).toBeHidden();
        
        const publishBtn = page.getByTestId(FORM_EDITOR.UI_ELEMENTS.PUBLISH_BUTTON);
        await page.waitForTimeout(TIMEOUTS.UI_ANIMATION);
        await publishBtn.click();
        
        const previewButton = page.getByTestId(FORM_EDITOR.UI_ELEMENTS.PUBLISH_PREVIEW_BUTTON);
        await expect(previewButton).not.toBeDisabled({ timeout: TIMEOUTS.FORM_PUBLISH });
        const link = await previewButton.getAttribute("href");
        expect(link).toBeTruthy();
        
        let publishedForm = await simulateUser(link!);
        
        const publishedOptionTexts = await publishedForm.getSingleChoiceOptions();
        
        expect(JSON.stringify(originalOptionTexts) !== JSON.stringify(publishedOptionTexts));
        
        await expect(publishedForm.page.getByTestId(PUBLISHED_FORM.GROUPS.FORM_GROUP_QUESTION).filter({ hasText: FIELD_TITLES.MULTI_CHOICE_DEMO})).toBeHidden();
        
        await page.getByText(FIELD_TITLES.MULTI_CHOICE_DEMO).first().click();
        await hideSwitch.click();
        await page.waitForTimeout(TIMEOUTS.UI_ANIMATION);
        await publishBtn.click();
        
        publishedForm = await simulateUser(link!);
        
        await expect(publishedForm.page.getByTestId(PUBLISHED_FORM.GROUPS.FORM_GROUP_QUESTION).filter({ hasText: FIELD_TITLES.MULTI_CHOICE_DEMO})).toBeVisible();
        
        await publishedForm.page.close();
    });
    
    test("verify form insights", async ({
        formDashboard,
        formEditor,
        analyticsPage,
        simulateUser,
        page,
        browser
    }) => {
        await formDashboard.createNewForm();
        await formEditor.setFormName(formName);
        
        await analyticsPage.open();
        await analyticsPage.expectMetrics({
            visits: '0',
            starts: '0',
            submissions: '0',
            completion: '0%'
        });
        
        await page.waitForTimeout(TIMEOUTS.UI_ANIMATION);
        await page.getByTestId(FORM_EDITOR.UI_ELEMENTS.PUBLISH_BUTTON).click();
        const previewButton = page.getByTestId(FORM_EDITOR.UI_ELEMENTS.PUBLISH_PREVIEW_BUTTON);
        await expect(previewButton).not.toBeDisabled({ timeout: TIMEOUTS.FORM_PUBLISH });
        const link = await previewButton.getAttribute("href");
        if (!link) throw new Error("No link found in the publish preview button");
        
        const context1 = await browser.newContext();
        const user1 = await context1.newPage();
        await user1.goto(link);
        await user1.close();
        await context1.close();
        
        await analyticsPage.open();
        const metricsAfterVisit = await analyticsPage.getMetrics();
        expect(metricsAfterVisit.visits).toBe('1');
        
        const context2 = await browser.newContext();
        const user2 = await context2.newPage();
        await user2.goto(link);
        await user2.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.EMAIL).fill(email);
        await user2.close();
        await context2.close();
        
        await analyticsPage.open();
        const metricsAfterStart = await analyticsPage.getMetrics();
        expect(metricsAfterStart.visits).toBe('2');
        expect(metricsAfterStart.starts).toBe('1');
        
        const context3 = await browser.newContext();
        const user3 = await context3.newPage();
        await user3.goto(link);
        await user3.getByTestId(PUBLISHED_FORM.INPUT_FIELDS.EMAIL).fill(email);
        await user3.getByTestId(PUBLISHED_FORM.BUTTONS.SUBMIT).click();
        await user3.close();
        await context3.close();
        
        await analyticsPage.open();
        const metricsAfterSubmission = await analyticsPage.getMetrics();
        expect(metricsAfterSubmission.visits).toBe('3');
        expect(metricsAfterSubmission.starts).toBe('2');
        expect(metricsAfterSubmission.submissions).toBe('1');
    });
});