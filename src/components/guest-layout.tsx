import Header from './header';
import Footer from './footer';

const GuestLayout: React.FC<React.PropsWithChildren<{}>> = (props) => (
  <div>
    <Header />
    {props.children}
    <br />
    <Footer />
  </div>
);

export default GuestLayout;
