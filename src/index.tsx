import React from "react";
import ReactDOM from "react-dom/client";

// service callbacks start
import { appTitlePrefix } from "./configuration";
import { postLogout, postLogin, canAccess } from './configuration';
import { configureResources, configureMenus, configureLandingPage } from './resources';
import { businessLogic } from "./businessLogic";
import { queryClientConfig } from "./configuration";
import { configureUserMenus } from "./configuration";
import { configureToolbarActions } from "./configuration";
import { themes } from "./configuration";
import { wrapCustomDataProvider } from "./configuration";
import { customizeI18nProvider } from "./configuration";
//import {customHistoryLogger} from "./configuration";
//import { customLogoBox } from "./configuration";
//import { customAppTitle } from "./configuration";
//import { customLayout } from "./configuration";
import { functionRegistry } from "./backend/registry";
import { appSharedActions } from "./sharedActions";

const appFunctions = {
    appTitlePrefix,
    postLogout,
    postLogin,
    canAccess,
    configureResources, 
    configureMenus,
    configureLandingPage,
    businessLogic,
    queryClientConfig,
    configureUserMenus,
    configureToolbarActions,
    themes,
    wrapCustomDataProvider,
    customizeI18nProvider,
    functionRegistry,
    sharedActions: appSharedActions,
    //customHistoryLogger,
    //customLogoBox,
    //customAppTitle,
    //customLayout
}

window.swanAppFunctions = appFunctions;
// service callbacks end

import { initService } from "@mahaswami/vc-frontend";
import appConfigOptions from '../vegacore.json';
import appPermissions from '../vegacore.permissions.json';

const devEnv = import.meta.env.VITE_APP_ENV;
const devDataServiceProvider = import.meta.env.VITE_DATA_SERVICE_PROVIDER;
const devDataServiceSpreadsheetId = import.meta.env.VITE_DATA_SERVICE_SPREADSHEET;

await initService(import.meta.env,  devDataServiceProvider, devDataServiceSpreadsheetId, appConfigOptions, appPermissions);

import { App } from "@mahaswami/vc-frontend";

import {ReactFromModule} from "@mahaswami/vc-frontend";
import {registerServiceWorker} from "./utils.ts";
console.log("DEBUG: React same?")
console.log(React === ReactFromModule) //false

const renderApp = () => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
}

registerServiceWorker()
    .then(_ => renderApp())
    .catch(err => {
        console.error('Service worker registration failed:', err);
        renderApp()
    });