import ClientHandler from '@pawjs/pawjs/src/client/handler';
// Bulma CSS for light weight CSS. One can any css framework
import 'bulma/css/bulma.min.css';
import './resources/css/util.scss';
import './resources/css/global.css';

declare global {
  interface Window { gtag: any; }
}


export default class Client {
  advertiseTimeout: ReturnType<typeof setTimeout> | null = null;

  clearAdvertiseTimeout() {
    if (this.advertiseTimeout) {
      clearTimeout(this.advertiseTimeout);
    }
    this.advertiseTimeout = null;
  }

  advertise() {
    this.clearAdvertiseTimeout();
    this.advertiseTimeout = setTimeout(() => {
      let codeFundDiv = document.getElementById('codefund_ad');
      if (!codeFundDiv) {
        codeFundDiv = document.createElement('div');
        codeFundDiv.id = 'codefund';
        const footerElement = document.querySelector('footer.footer');
        if (footerElement) {
          const jsCodefund = document.getElementById('js-codefund') as HTMLScriptElement | null;
          if (jsCodefund) {
            footerElement.appendChild(codeFundDiv);
            if (jsCodefund.src) {
              const newJsCodefund = document.createElement('script');
              setTimeout(() => {
                newJsCodefund.src = `${jsCodefund.getAttribute('data-src')}?v=${(new Date()).getTime()}`;
                newJsCodefund.id = jsCodefund.id;
                newJsCodefund.setAttribute('data-src', jsCodefund.getAttribute('data-src') || '');
                jsCodefund.remove();
                document.body.append(newJsCodefund);
              }, 100);
              //
            } else {
              jsCodefund.src = jsCodefund.getAttribute('data-src') || '';
            }
          }
        }
      } else {
        const jsCodefund = document.getElementById('js-codefund') as HTMLScriptElement | null;
        if (jsCodefund) {
          if (jsCodefund.src) {
            const newJsCodefund = document.createElement('script');
            setTimeout(() => {
              newJsCodefund.src = `${jsCodefund.getAttribute('data-src')}`;
              newJsCodefund.id = jsCodefund.id;
              newJsCodefund.setAttribute('data-src', jsCodefund.getAttribute('data-src') || '');
              jsCodefund.remove();
              document.body.append(newJsCodefund);
            }, 100);
          } else {
            jsCodefund.src = jsCodefund.getAttribute('data-src') || '';
          }
        }
      }
    }, 100);
  }

  static googleTrack() {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'UA-108804791-2', {
        page_path: window.location.pathname,
      });
    }
  }

  apply(clientHandler: ClientHandler) {
    clientHandler.hooks.locationChange.tapPromise('ReloadAds', async () => this.advertise());
    clientHandler.hooks.locationChange.tapPromise('ReloadGoogleTrack', async () => Client.googleTrack());
    clientHandler.hooks.renderComplete.tap('ReloadAds', async () => this.advertise());
  }
}
