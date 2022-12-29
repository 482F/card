import WebSocket from 'ws'
import throttle from 'lodash/throttle'

const wss = new WebSocket.Server({
  port: 18245,
  host: 'localhost',
})

const rooms = {}

// 接続処理
function send(client, key, value) {
  let message = key
  if (value !== undefined) {
    message += '-' + JSON.stringify(value)
  }
  client.send(message)
}

const broadcast = throttle((room) => {
  ;[...wss.clients].forEach((someClient) => {
    send(someClient, 'changeValue', room.unBroadcasted[someClient.id])
  })
  Object.values(room.unBroadcasted).forEach((obj) => {
    for (const key of Object.keys(obj)) {
      delete obj[key]
    }
  })
}, 1000 / 60)

wss.on('connection', (client) => {
  // クライアントからのリクエストを受け取った際の処理
  client.on('message', (rawMessage) => {
    const room = rooms[client.password]

    const [, key, , message] = new TextDecoder()
      .decode(rawMessage)
      .match(/^([^-]+)(-(.+))?$/)
    const value = JSON.parse(message)
    if (key === 'changePublic') {
      // changed は新規ログイン時に配信のために保存
      Object.assign(room.changed, value)

      // unBroadcasted は、自分ではない client へ配信するべきデータを保持する
      // 自分が特定のキーを更新した場合、そのキーの値は自分に配信されなくて良いため、既存の値は削除する
      Object.entries(room.unBroadcasted)
        .filter(([id]) => client.id !== id)
        .forEach(([, obj]) => Object.assign(obj, value))
      for (const key of Object.keys(value)) {
        delete room.unBroadcasted[client.id][key]
      }

      broadcast(room)
    } else if (key === 'deleteChangeds') {
      const patterns = value.map((rawPattern) => new RegExp(rawPattern))
      for (const key of Object.keys(room.changed)) {
        if (patterns.some((pattern) => key.match(pattern))) {
          delete room.changed[key]
        }
      }
    } else if (key === 'login') {
      const { password, id } = value
      client.password = password
      client.id = id
      rooms[password] ??= {
        changed: {},
        unBroadcasted: {},
      }
      rooms[password].unBroadcasted[id] ??= {}

      send(client, 'initialize', rooms[password].changed)
    }
  })
})

export default { handler: wss }
