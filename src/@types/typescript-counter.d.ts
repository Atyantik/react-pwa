declare module 'guest-layout' {
  interface IProps {
    image: any;
    imgClassName: string;
    alt: string;
    name?: string;
  }
  class Picture extends React.Component<IProps, any> {}
  export default Picture;
}

declare module '*?sizes=400w+800w&placeholder' {}
