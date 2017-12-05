#!/usr/bin/env bash
yarn build
cd dist && tar cvfz ../dist.tar.gz . && cd ..
scp dist.tar.gz $ATYANTIK_USER@$ATYANTIK_SERVER:$DEPLOY_PATH
ssh $ATYANTIK_USER@$ATYANTIK_SERVER "cd $DEPLOY_PATH && tar xvzf dist.tar.gz --overwrite"
ssh $ATYANTIK_USER@$ATYANTIK_SERVER "cd $DEPLOY_PATH && rm -rf dist.tar.gz"