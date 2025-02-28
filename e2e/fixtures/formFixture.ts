import { test as base } from '@playwright/test';

import { FormDashboardPage } from '../poms/formDashboard';
import { PublishedFormPage } from '../poms/publishedForm';
import { FormEditorPage } from '../poms/formEditor';
import { AnalyticsPage } from '../poms/analyticsPage';

import { faker } from '@faker-js/faker';

type FormFixtures = {
    formDashboard: FormDashboardPage;
    formEditor: FormEditorPage;
    analyticsPage: AnalyticsPage;

    createPublishedForm: () => Promise<{ formName: string, publishUrl: string }>;
    simulateUser: (url: string) => Promise<PublishedFormPage>;
};

export const test = base.extend<FormFixtures>({
    formDashboard: async ({ page }, use) => {
        const dashboard = new FormDashboardPage(page);
        await dashboard.goto();
        await dashboard.login({ email: "oliver@example.com", password: "welcome" });
        await use(dashboard);
    },

    formEditor: async ({ page }, use) => {
        const editor = new FormEditorPage(page);
        await use(editor);
    },

    analyticsPage: async ({ page }, use) => {
        const analytics = new AnalyticsPage(page);
        await use(analytics);
    },

    createPublishedForm: async ({ page, formDashboard, formEditor}, use) => {
        const createForm = async () => {
            const formName = faker.word.words({ count: 2 });

            await formDashboard.createNewForm();
            await formEditor.setFormName(formName);
            
            const publishUrl = await formEditor.publishForm();

            if (!publishUrl) {
                throw new Error("Failed to get publish URL");
            }

            return { formName, publishUrl };
        };

        await use(createForm);
    },

    simulateUser: async ({ browser }, use) => {
        const createUser = async (url: string) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            const formPage = new PublishedFormPage(page);

            await formPage.goto(url);
            return formPage;
        };

        await use(createUser);
    }
});