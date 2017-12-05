[![Backers on Open Collective](https://opencollective.com/react-pwa/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/react-pwa/sponsors/badge.svg)](#sponsors) [![Dependencies Status](https://david-dm.org/Atyantik/react-pwa.svg)](https://david-dm.org/Atyantik/react-pwa)
[![devDependencies Status](https://david-dm.org/Atyantik/react-pwa/dev-status.svg)](https://david-dm.org/Atyantik/react-pwa?type=dev)
[![Build Status](https://travis-ci.org/Atyantik/react-pwa.svg?branch=master)](https://travis-ci.org/Atyantik/react-pwa)
[![Known Vulnerabilities](https://snyk.io/test/github/atyantik/react-pwa/badge.svg)](https://snyk.io/test/github/atyantik/react-pwa)
[![Greenkeeper badge](https://badges.greenkeeper.io/Atyantik/react-pwa.svg)](https://greenkeeper.io/)  

[![Join the chat at https://gitter.im/react-pwa](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/react-pwa/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)


# React PWA
A highly scalable, Progressive Web Application foundation with the best Developer Experience.

[https://www.reactpwa.com is built with this awesome framework. Why don't you check it out.](https://www.reactpwa.com/)

###### Add to home screen and make your application behave like a Native APP
If you are not able to view the gif below, just click "PWA States Gif" or the broken image:  

[![PWA States Gif](https://media.giphy.com/media/xT9Igz9xhXychk8LyE/giphy.gif)](https://www.atyantik.com/wp-content/uploads/2017/10/PWA-States.png)

#### Current Repo in Action
To view how the current repository is running please visit [https://demo.reactpwa.com](https://demo.reactpwa.com)

#### Features
##### PWA  - Progressive Web Applications
Using ReactPWA you can create Progressive web application with simple knowledge of React.JS. As we all know, Progressive Apps are not supported everywhere, but we have added support for Safari & Chrome so your application can work as 
standalone applications when added to homescreen or saved as desktop app.  
[Read More](https://www.reactpwa.com/features/pwa-progressive-web-application)

##### Code splitting
The very difficulty faced when developing enterprise application is code splitting. We don't need everything in a single JS file. Why not create individual JS files for each respective module/page!
We make it really easy here to just create a page that returns an array of routes. Code is split and loaded automatically when the respective route is called.  
[Read More](https://www.reactpwa.com/features/code-splitting)  

##### Hot Reloading
Development is much easier with hot reloading. Make changes and the code is auto/hot-reloaded in the browser.
And we did not miss "sass". Preserve application state when you update underlying code.  
[Read More](https://www.reactpwa.com/features/hot-reloading)
  

##### ES6/7 Compatible
Using babel, we support next generation JavaScript syntax including Object/Array destructuring, arrow functions, JSX syntax and more...  
[Read More](https://www.reactpwa.com/features/next-gen-js-es6-es7)  

##### Universal Routing with React-Router
We are using the most accepted React router for routing the application. Add your favorite /about, /contact, /dashboard pages.  
[Read More](https://www.reactpwa.com/features/isomorphic-universal-routing)  


##### Offline support
Yes your application is offline available. Run without internet. Pretty cool huh?? Well all thanks to service workers.  
[Read More](https://www.reactpwa.com/features/access-offline)  

##### SSR - Server side rendering
The best way to get your application SEO-ed is enable Server side rendering i.e. Universal applications.  
[Read More](https://www.reactpwa.com/features/seo-search-engine-optimization/ssr-server-side-rendering)  
  

##### SEO
Our customized routes enable creating meta tags to create Twitter, Google+, Linkedin, Facebook cards. We know how important SEO is to an application.  
[Read More](https://www.reactpwa.com/features/seo-search-engine-optimization)  

##### Content Folding
Show only relevant data when loading via server. Fold your content to save bytes.  
[Read More](https://www.reactpwa.com/features/seo-search-engine-optimization/content-folding)  


##### Page Caching
Well now you can cache a page in SSR. Pretty simple. Just add cache option to route.  
`{ cache: { enable: true, duration: 10000}}`
This helps you cache pages when rendered via server. Why increase server load when page is static and cacheable!  
[Read More](https://www.reactpwa.com/features/caching)  

##### WebP Support 
Make your application super fast with WebP support. Read more about it at:
[https://developers.google.com/speed/webp/](https://developers.google.com/speed/webp/)  

##### Image optimizations
Optimize your images when you create a build. This is a slow build process, but is totally worth it when your site loads fast. We are using imagemin plugins to optimize 
SVG, JPEG, GIF & PNG  
[Read More](https://www.reactpwa.com/features/image-optimization)  

##### HSTS Supported
Enable HSTS for secure sites. Options to define maxAge and preload of HSTS. All with very simple configuration.  
[Read More](https://www.reactpwa.com/features/hsts)  

### Quick start

- Clone this repo using: `git clone --depth=1 https://github.com/Atyantik/react-pwa.git`
- Move to the appropriate directory: `cd react-pwa`.
- Use yarn to install dependencies: `npm install`
- run `npm start` to see the example app at: http://localhost:3003.
- To build the application you should run: `npm run build`
- To build and run PWA demo use the command: `npm run build && node dist/server.js`  

Now you are all set, Get your hands dirty with this awesome boilerplate.  

### Documentation
*Still in progress... But why don't you check out our [Documentation](https://www.reactpwa.com/docs)*  

### Testing
*We have not written any test cases yet. Mocha is set up for testing, and we welcome any contribution to help us out.*  

### Docker support
Now easily manage docker-build, given Docker is properly configured and the terminal that is running node has access to docker command.

##### Working with docker:

`npm run docker:dev:image` 
Will create a development image named "react-pwa" which will be used during application development and running.
If anything new is added to package.json `npm run docker:dev:image` must be rebuilt to get the latest nodejs packages.

`npm run docker:dev:start`  
Will start the application in docker mode.  
 
`npm run docker:prod:build`  
Will start the build the application for production.  
 
`npm run docker:prod:image`  
Will create a docker image that can be deployed easily to any docker-hub and can create production containers.  

`npm run docker:prod:start`  
Will start the application in production mode, it's necessary to create docker:prod:image prior to docker:prod:start.  


### Need contributors.
This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="https://github.com/Atyantik/react-pwa/graphs/contributors"><img src="https://opencollective.com/react-pwa/contributors.svg?width=890" /></a>

We are actively looking for contributors for testing and documentation.
Please contact us: admin [at] atyantik.com or contact [at] atyantik.com  

Visit us at [Atyantik Technologies Private Limited](https://www.atyantik.com)

### Backers
Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/react-pwa#backer)]
<a href="https://opencollective.com/react-pwa#backers" target="_blank"><img src="https://opencollective.com/react-pwa/backers.svg?width=890"></a>


### Sponsors
Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/react-pwa#sponsor)]

<a href="https://opencollective.com/react-pwa/sponsor/0/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/1/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/2/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/3/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/4/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/5/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/6/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/7/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/8/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/react-pwa/sponsor/9/website" target="_blank"><img src="https://opencollective.com/react-pwa/sponsor/9/avatar.svg"></a>

### Supporters
##### Eventerprise.com
<a href="https://www.eventerprise.com" target="_blank"><img width="80px" src="https://www.reactpwa.com/build/images/app/components/footer/9a05e4e59d20232f55938f0454da55f4.png"></a>  
Eventerprise is the first company to implement react-pwa, The whole idea of PWA applications with react was created with unique requirement of Eventerprise. [Do try the application](https://www.eventerprise.com).  

##### Browser stack
Thanks to Browser stack we are able to test the PWA nature of application on various mobiles and write automated test cases.  
[![Browser Stack](https://www.atyantik.com/wp-content/uploads/2017/10/Browser-Stack-Logo.png)](https://www.browserstack.com)

### License
This project is licensed under the MIT license, Copyright (c) 2017 Atyantik Technologies Private Limited. For more information see LICENSE.md.  