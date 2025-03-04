import { test } from '../fixtures/pageFixture';
import { expect } from '@playwright/test'; 
import { faker } from '@faker-js/faker';

test.describe("Verify form insights", () => {

    let formName: string;
    let email: string;
    let email_two: string;
    let publishedUrl: string;

    test.beforeEach(async ({ page }) => {
        formName = faker.word.words({ count: 2 });
        email = faker.internet.email();
        email_two = faker.internet.email();
        await page.goto('/');
    });

    test("Create a form, publish it and check the metrics", async ({ 
        dashboard, 
        formBuilder, 
        publishedForm, 
        analytics,
        page,
        browser
    }) => {
    
        await test.step("Step 1: Navigate to form builder, create and publish form", async () => {
            await dashboard.navigateToFormBuilder();
            
            await formBuilder.setFormName(formName);
            await formBuilder.publishForm();
            publishedUrl = await formBuilder.returnPublishUrl(); 
        
            await formBuilder.navigateToAnalytics();
        });

        await test.step("Step 2: First visit - check visits metric", async () => {
            const newPage = await page.context().newPage();
            await newPage.goto(publishedUrl);
            publishedForm.initialize(newPage);

            const visits1 = await analytics.getVisits();
            expect(visits1).toBe(1);
            await newPage.close();
        });
    
        await test.step("Step 3: Second visit with form start - check visits and starts metrics", async () => {
            const newPage = await page.context().newPage();
            await newPage.goto(publishedUrl);
            publishedForm.initialize(newPage);

            await publishedForm.fillEmail(email);
            const visits2 = await analytics.getVisits();
            const starts1 = await analytics.getStarts();
            expect(visits2).toBe(2);
            expect(starts1).toBe(1);
            await newPage.close();
        });
    
        await test.step("Step 4: Third visit with form submission - check all metrics", async () => {
            const incognitoContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
            const incognitoPage = await incognitoContext.newPage();
            
            await incognitoPage.goto(publishedUrl);
            publishedForm.initialize(incognitoPage);

            await publishedForm.fillEmail(email_two);
            await publishedForm.submitForm();
            const visits3 = await analytics.getVisits();
            const starts2 = await analytics.getStarts();
            const submissions1 = await analytics.getSubmissions();
            expect(visits3).toBe(3);
            expect(starts2).toBe(2);
            expect(submissions1).toBe(1);
            await incognitoPage.close(); 
            await incognitoContext.close(); 
        });
    
        await test.step("Step 5: Clean up - delete form", async () => {
            await dashboard.deleteForm(formName);
        });
    });
});