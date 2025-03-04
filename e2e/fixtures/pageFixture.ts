import { test as base } from '@playwright/test';
import PublishedForm from '../poms/publishedForm';
import Dashboard from '../poms/dashboard';
import FormBuilder from '../poms/formBuilder';
import AnalyticsPage from '../poms/analytics';
import SubmissionsPage from '../poms/submissions';

type PageFixtures = {
  dashboard: Dashboard;
  formBuilder: FormBuilder;
  publishedForm: PublishedForm;
  analytics: AnalyticsPage;
  submissions: SubmissionsPage;
};

export const test = base.extend<PageFixtures>({
  // Base pages
  dashboard: async({ page }, use) => {
    const dashboard = new Dashboard(page);
    await use(dashboard);
  },
  
  publishedForm: async({ page }, use) => {
    const publishedForm = new PublishedForm(page);
    await use(publishedForm);
  },

  // Pages that depend on other pages
  formBuilder: async({ page }, use) => {
    const formBuilder = new FormBuilder(page);
    await use(formBuilder);
  },
  
  analytics: async({ page }, use) => {
    const analytics = new AnalyticsPage(page);
    await use(analytics);
  },
  
  submissions: async({ page }, use) => {
    const submissions = new SubmissionsPage(page);
    await use(submissions);
  },
  
});