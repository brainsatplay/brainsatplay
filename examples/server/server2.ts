import main from './main'
import {settings} from '../../src/settings'

main(settings.port2, {
  websocket: true,
  webrtc: true
})