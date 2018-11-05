// Bulma CSS for light weight CSS. One can any css framework
import 'bulma/css/bulma.min.css';
import './resources/css/util.scss';
import './resources/css/global.css';

export default class Client {
  advertiseTimeout = 0;

  clearAdvertiseTimeout() {
    if (this.advertiseTimeout) {
      clearTimeout(this.advertiseTimeout);
    }
    this.advertiseTimeout = 0;
  }

  advertise() {
    this.clearAdvertiseTimeout();
    this.advertiseTimeout = setTimeout(() => {
      let codeFundDiv = document.getElementById('codefund_ad');
      if (!codeFundDiv) {
        codeFundDiv = document.createElement('div');
        codeFundDiv.id = 'codefund_ad';
        const footerElement = document.querySelector('footer.footer');
        if (footerElement) {
          footerElement.appendChild(codeFundDiv);
        }
      }

      // eslint-disable-next-line
      if (typeof window._codefund !== 'undefined' && window._codefund.serve) {
        // eslint-disable-next-line
        window._codefund.serve();
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

  apply(clientHandler) {
    clientHandler.hooks.locationChange.tapPromise('ReloadAds', async () => this.advertise());
    clientHandler.hooks.locationChange.tapPromise('ReloadAds', async () => Client.googleTrack());
    clientHandler.hooks.renderComplete.tap('ReloadAds', async () => this.advertise());
  }
}
