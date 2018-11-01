import React from 'react';

export default () => (
  <footer className="footer">
    <div className="content has-text-centered">
      <p>
        <strong>Demo for ReactPWA</strong>
        {' '}
        by
        {' '}
        <a href="https://www.atyantik.com">Atyantik Technologies</a>
        . The source code is licensed
        {' '}
        <a href="http://opensource.org/licenses/mit-license.php">MIT</a>
        .
        <br />
        Visit the site&quot;s Github Repo
        {' '}
        <a href="https://github.com/Atyantik/react-pwa">https://github.com/Atyantik/react-pwa</a>
        .
      </p>
      <div className="has-text-centered m-t-xl m-b-md">
        <a href="https://opencollective.com/react-pwa/donate" target="_blank" rel="nofollow noopener noreferrer">
          <img alt="open-collective" src="https://opencollective.com/react-pwa/contribute/button@2x.png?color=blue" width="300" />
        </a>
      </div>
    </div>
  </footer>
);
