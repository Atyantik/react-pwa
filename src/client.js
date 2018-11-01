// Bulma CSS for light weight CSS. One can any css framework
import 'bulma/css/bulma.min.css';
import './resources/css/util.scss';
import './resources/css/global.css';

export default class Client {
  static advertise() {
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
  }

  // eslint-disable-next-line
  apply(clientHandler) {
    clientHandler.hooks.locationChange.tapPromise('ReloadAds', async () => Client.advertise());
    clientHandler.hooks.renderComplete.tap('ReloadAds', async () => Client.advertise());
  }
}
