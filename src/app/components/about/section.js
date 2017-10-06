import React from "react";
import _ from "lodash";

export default (props) => {
  "use strict";

  switch(_.get(props, "match.params.section", "")) {
    case "about-us":
    default:
      return (
        <div>
          <h1 className="h2">About Us</h1>
          <h3 className="h4">The Ultimate Technology Maniacs</h3>
          <h5 className="h6">Atyantik <i>means</i> Ultimate</h5>
          <p>
          We are a group of technology maniacs, extremely
          passionate about coding which means we do all
          the IT related tasks, so our clients do not have to.
          We bring passion to bear on client’s project and work
          hard to achieve the desired results. Our main aim is to
          provide our clients with cost effective, up to date and
          relevant software solutions. We love to constantly
          upgrade our technologies and keep our clients informed
          about new developments.
          </p>
        </div>
      );
    case "we-execute-your-dreams":
      return (
        <div>
          <h1 className="h2">We execute your dreams</h1>
          <h5 className="h6">Beware:: execution process consumes lots of pizza and coffee!</h5>
          <p>
          Once a visionary was questioned, “If you are granted a wish,
          what would you ask for? Money or Success?”, he replied very
          beautifully, “Loyal & obedient teammates”.
          </p>
          <p>
          Success is measured by other people, satisfaction comes from within.
          A visionary can only be satisfied with Loyal & Obedient teammates
          who believes in his vision and provide their skills for attaining goals.
          </p>
        </div>
      );
    case "do-not-hire-us":
      return (
        <div>
          <div>
            <h1 className="h2">Don't hire us</h1>
            <h5 className="h6">Looking for experts?</h5>
            <p>
            Hiring to us is just creating a temporary relationship! Make us your teammates,
            you share your thoughts and we share our input. We love to innovate.
            Give us the opportunity to be your teammates and create something so wonderful
            that it exceeds all expectations!
            </p>
          </div>
        </div>
      );
  }
};