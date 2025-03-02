import { test as base } from '@playwright/test';
import LoginPage from '../poms/login';
import FormBuilder from '../poms/formBuilder';
import PublishedForm from '../poms/publishedForm';
import SubmissionsPage from '../poms/submissions';
import Dashboard from '../poms/dashboard';

type PageFixtures = {
  loginPage: LoginPage;
  formBuilder: FormBuilder;
  publishedForm: PublishedForm;
  submissionsPage: SubmissionsPage;
  dashboard: Dashboard;
};

export const test = base.extend<PageFixtures>({
  loginPage: async({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboard: async({ page }, use) => {
    const dashboard = new Dashboard(page);
    await use(dashboard);
  },

  formBuilder: async ({ page }, use) => {
    const formBuilder = new FormBuilder(page);
    await use(formBuilder);
  },
  
  submissionsPage: async ({ page }, use) => {
    const submissionsPage = new SubmissionsPage(page);
    await use(submissionsPage);
  },
  
  publishedForm: async ({ browser }, use) => {
    // Create new browser context for the published form
    const context = await browser.newContext();
    const newPage = await context.newPage();
    
    const publishedForm = new PublishedForm(newPage);
    await use(publishedForm);
    
    // Clean up
    await context.close();
  },
});