import { test } from '../fixtures/pageFixture';
import { expect } from '@playwright/test'; 
import { faker } from '@faker-js/faker';
import FormBuilder from '../poms/formBuilder';

test.describe("Verify form insights", () => {

    let formName: string;
    let email: string;

    test.beforeEach(async ({ page }) => {
        formName = faker.word.words({ count: 2 });
        email = faker.internet.email();

        await page.goto('/');
    });

    test("Create a form, publish it and check the metrics", async ({ dashboard, browser }) => {
        let formBuilder, publishedForm, analytics;
    
        formBuilder = await dashboard.navigateToFormBuilder();
        
        await formBuilder.setFormName(formName);
        await formBuilder.publishForm();
    
        // Make sure to await the analytics navigation
        analytics = await formBuilder.navigateToAnalytics();
        
        // First visit
        publishedForm = await formBuilder.openPublishedForm(browser);
        // Wait to regisrer
        await publishedForm.page.waitForTimeout(2000);
        const visits1 = await analytics.getVisits();
        expect(visits1).toBe(1);
        await publishedForm.close();
    
        // Second visit with form start
        publishedForm = await formBuilder.openPublishedForm(browser);
        await publishedForm.fillEmail(email);
        await publishedForm.page.waitForTimeout(2000);
        const visits2 = await analytics.getVisits();
        const starts1 = await analytics.getStarts();
        expect(visits2).toBe(2);
        expect(starts1).toBe(1);
        await publishedForm.close();
    
        // Third visit with form submission
        publishedForm = await formBuilder.openPublishedForm(browser);
        await publishedForm.fillEmail(email);
        await publishedForm.submitForm();
        await publishedForm.page.waitForTimeout(2000);
        const visits3 = await analytics.getVisits();
        const starts2 = await analytics.getStarts();
        const submissions1 = await analytics.getSubmissions();
        expect(visits3).toBe(3);
        expect(starts2).toBe(2);
        expect(submissions1).toBe(1);
        await publishedForm.close();
    
        // Delete form
        const dashboardPage = await analytics.navigateToDashboard();
        await dashboardPage.deleteForm(formName);
    });
});