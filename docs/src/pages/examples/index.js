import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ExampleSelector from './selector';
import SessionsService from './../../../../src/services/sessions/sessions.service';
import DatabaseService from './../../../../src/services/database/database.service';
import UnsafeService from './../../../../src/services/unsafe/unsafe.service';

import OSCClient from './../../../../src/services/osc/osc.frontend';
import WebRTCClient from './../../../../src/services/webrtc/webrtc.frontend';
import HTTPClient from './../../../../src/services/http/http.frontend';
import WebsocketClient from './../../../../src/services/websocket/websocket.frontend';
import { Router } from './../../../../src/core/Router';
import { randomId } from '../../../../src/common/id.utils';

import {settings} from '../../../../src/settings.js'

let router = new Router()

const SERVER_URI = settings.protocol+"://"+settings.hosturl+":"+settings.port//(window.location.href.includes('localhost')) ? 'http://localhost:80' : 'http://localhost:80' // Replace with production server URI
const SERVER_URI_2 = settings.protocol+"://"+settings.hosturl+":"+settings.port2//(window.location.href.includes('localhost')) ? 'http://localhost:81' : 'http://localhost:81' // Replace with production server URI

let services = [
  new SessionsService(router), 
  new UnsafeService(router),
  new DatabaseService(router),

  new OSCClient(router), 
  new WebsocketClient(router), 
  new WebRTCClient(router), 
  new HTTPClient(router),
]

services.forEach(service => {
  console.log('LOADING', service.name)
  router.load(service).then(() => {
    console.log(`${service.constructor.name} connected!`)
  })
})

const id = randomId()

const sockets = []
const socket = router.connect({
  target: SERVER_URI,
  credentials: {id, _id: id}
})
sockets.push(socket)
const socket2 = router.connect({
  target: SERVER_URI_2,
  credentials: {id, _id: id}
})

sockets.push(socket2)


socket.send('http/add', {
  method: 'POST',
  message: ['/ssr/socket', '<p>Just some arbitrary HTML</p>']
})

socket.send('echo', {
  method: 'POST',
  message: ['test']
})

router.post('http/add', '/ssr/test', '<p>Just some arbitrary HTML</p>')



export default function Examples() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} | Examples`}
      description={`Examples for ${siteConfig.title}.`}>
      <ExampleSelector 
        server={SERVER_URI}
        sockets={sockets}
        router={router}
        id={id}
      />
    </Layout>
  );
}
