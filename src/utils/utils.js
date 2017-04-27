/**
 * Check if current script is running in browser or not
 * @returns {boolean}
 */
export const isBrowser = () => {
  "use strict";
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Load stylesheet
 * @param path
 * @param fn
 * @param scope
 * @returns {Element}
 */
export const loadStyle = ( path, fn = () => {}, scope ) => {
  if (!isBrowser()) {
    // If not a browser then do not allow loading of
    // css file, return with success->false
    fn.call( scope, false );
  }

  // Do not load css if already loaded
  const previousLink = document.getElementById(path);
  if (previousLink) {
    fn.call( scope, true, previousLink);
    return;
  }

  const head = document.getElementsByTagName( "head" )[0], // reference to document.head for appending/ removing link nodes
    link = document.createElement( "link" );           // create the link node
  link.setAttribute( "href", path );
  link.setAttribute( "id", path );
  link.setAttribute( "rel", "stylesheet" );
  link.setAttribute( "type", "text/css" );

  let sheet, cssRules;
  // get the correct properties to check for depending on the browser
  if ( "sheet" in link ) {
    sheet = "sheet"; cssRules = "cssRules";
  }
  else {
    sheet = "styleSheet"; cssRules = "rules";
  }

  // start checking whether the style sheet has successfully loaded
  let interval_id = setInterval( function() {
      try {
        // SUCCESS! our style sheet has loaded
        if ( link[sheet] && link[sheet][cssRules].length ) {

          // clear the counters
          clearInterval( interval_id );

          // Declared after "," so it will be available in Interval
          clearTimeout( timeout_id );

          // fire the callback with success == true
          fn.call( scope || window, true, link );
        }
      } catch(e){
        // Do nothing, timeout will handle it for fail after 15 seconds
      }
    }, 10 ),
    // how often to check if the stylesheet is loaded

    // start counting down till fail
    timeout_id = setTimeout( function() {
      // clear the counters
      clearInterval( interval_id );
      clearTimeout( timeout_id );

      // since the style sheet didn't load, remove the link node from the DOM
      head.removeChild( link );
      // fire the callback with success == false
      fn.call( scope || window, false, link );
      // how long to wait before failing
    }, 15000 );

  // insert the link node into the DOM and start loading the style sheet
  head.appendChild( link );

  // return the link node;
  return link;
};

/**
 * Load javascript file by path
 * @param path
 * @param fn
 * @param scope
 */
export const loadScript = (path, fn = () => {}, scope) => {
  if (!isBrowser()) {
    // If not a browser then do not allow loading of
    // css file, return with success->false
    fn.call( scope, false );
  }

  // Do not load script if already loaded
  const previousLink = document.getElementById(path);
  if (previousLink) {
    fn.call( scope, true, previousLink);
    return;
  }

  let s, r, t;
  r = false;
  s = document.createElement("script");
  s.type = "text/javascript";
  s.id = path;
  s.src = path;
  s.onload = s.onreadystatechange = function() {
    if (!r && (!this.readyState || this.readyState == "complete")) {
      r = true;
      fn.call( scope || window, true, s );
    }
  };
  t = document.getElementsByTagName("script")[0];
  t.parentNode.insertBefore(s, t);
};