import main from './main'
import {settings} from 'src/server_settings.js'

main(settings.port2, {
  websocket: true,
  webrtc: true
})