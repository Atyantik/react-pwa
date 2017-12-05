import inquirer from "inquirer";

const prompt = inquirer.createPromptModule();
prompt([
  {
    type: "confirm",
    name: "ssr",
    message: `Enable Server Side Rendering?
    If you are targeting SEO (search engine optimization) enable this option but keep in mind
    that SSR comes at cost of execution speed. If your application starts with a login page and
    does not care about getting indexed on search engines like google, bing etc then do not
    enable this option.`,
    default: true
  },
  {
    type: "confirm",
    name: "pwa",
    message: `Make it a progressive web application?
    If you are interested in creating a PWA, enable this option, this will enables features like push notifications, service-workers and Web App Manifests.
    `,
    default: true
  },
  {
    type: "confirm",
    name: "pwa-dev",
    when : answers => answers.pwa,
    message: `Enable PWA in development mode?
    Enabling this option will enable PWA nature in development mode, only enable this option if you are willing to work with service-worker else it can get confusing.
    `,
    default: false
  },
  {
    type: "confirm",
    name: "optimize-images",
    message: `Auto optimize images when creating a build?
    This process can take a while but its totally worth it. But we leave the decision to you.
    `,
    default: true
  },
  {
    type: "confirm",
    name: "vendor-bundling",
    message: `Create a common bundle for files included from node_modules?
    We do not recommend this options as it would create a common-vendor file that includes the dependencies of any 3rd party library imported from node_modules in any module.
    This can speed up the application and decrease the size of javascript of individual pages.
    Use this option only if you "do not care" about "first interactive" and "time to interactive".
    `,
    default: false
  }
  
]).then(answers => {
  console.log(answers);
});