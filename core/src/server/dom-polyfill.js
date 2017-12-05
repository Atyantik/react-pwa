import fetch from "universal-fetch";
const { JSDOM } = require("jsdom");

// Add polyfill of browser where necessary
if (typeof window === "undefined") {
  const window = (new JSDOM("", { runScripts: "outside-only" })).window;
  
  // Adding custom event
  if ( typeof window.CustomEvent !== "function" ) {
    const CustomEvent = function ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      let evt = document.createEvent( "CustomEvent" );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
    };
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  }
  
  // Add fetch to window
  window.fetch = fetch;
  
  const { document } = window;
  
  global.window = window;
  global.document = document;
  global.CustomEvent = window.CustomEvent;
}
