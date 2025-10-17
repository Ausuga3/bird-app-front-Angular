import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

// Angular SSR requires passing the BootstrapContext when bootstrapping on the server
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;
