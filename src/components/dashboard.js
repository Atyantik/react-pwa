import React from 'react';
import Protected from './protected';
import UserLayout from './user-layout';

export default () => (
  <Protected>
    <UserLayout>
      <div className="columns is-multiline">
        <div className="column">
          <div className="box notification is-primary">
            <div className="heading">Top Seller Total</div>
            <div className="title">56,950</div>
            <div className="level">
              <div className="level-item">
                <div className="">
                  <div className="heading">Sales $</div>
                  <div className="title is-5">250K</div>
                </div>
              </div>
              <div className="level-item">
                <div className="">
                  <div className="heading">Overall $</div>
                  <div className="title is-5">750K</div>
                </div>
              </div>
              <div className="level-item">
                <div className="">
                  <div className="heading">Sales %</div>
                  <div className="title is-5">25%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="box notification is-warning">
            <div className="heading">Revenue / Expenses</div>
            <div className="title">55% / 45%</div>
            <div className="level">
              <div className="level-item">
                <div className="">
                  <div className="heading">Rev Prod $</div>
                  <div className="title is-5">30%</div>
                </div>
              </div>
              <div className="level-item">
                <div className="">
                  <div className="heading">Rev Serv $</div>
                  <div className="title is-5">25%</div>
                </div>
              </div>
              <div className="level-item">
                <div className="">
                  <div className="heading">Exp %</div>
                  <div className="title is-5">45%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="box notification is-info">
            <div className="heading">Feedback Activity</div>
            <div className="title">78% &uarr;</div>
            <div className="level">
              <div className="level-item">
                <div className="">
                  <div className="heading">Pos</div>
                  <div className="title is-5">1560</div>
                </div>
              </div>
              <div className="level-item">
                <div className="">
                  <div className="heading">Neg</div>
                  <div className="title is-5">368</div>
                </div>
              </div>
              <div className="level-item">
                <div className="">
                  <div className="heading">Pos/Neg %</div>
                  <div className="title is-5">77% / 23%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="box notification is-danger">
            <div className="heading">Orders / Returns</div>
            <div className="title">75% / 25%</div>
            <div className="level">
              <div className="level-item">
                <div className="">
                  <div className="heading">Orders $</div>
                  <div className="title is-5">425K</div>
                </div>
              </div>
              <div className="level-item">
                <div className="">
                  <div className="heading">Returns $</div>
                  <div className="title is-5">106K</div>
                </div>
              </div>
              <div className="level-item">
                <div className="">
                  <div className="heading">Success %</div>
                  <div className="title is-5">+ 28,5%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  </Protected>
);
