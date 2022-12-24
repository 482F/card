import WebSocket from 'ws'

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

wss.on('connection', (client) => {
  // クライアントからのリクエストを受け取った際の処理
  client.on('message', (rawMessage) => {
    // 送信元を含むすべてのWebSocket接続済みクライアントに送信
    const [, key, , message] = new TextDecoder()
      .decode(rawMessage)
      .match(/^([^-]+)(-(.+))?$/)
    const value = JSON.parse(message)
    if (key === 'changePublic') {
      Object.assign(rooms[client.password], value)
      ;[...wss.clients]
        .filter((someClient) => someClient !== client)
        .forEach((someClient) => {
          send(someClient, 'changeValue', value)
        })
    } else if (key === 'password') {
      const password = value
      client.password = password
      rooms[password] ??= {}

      send(client, 'changeValue', rooms[password])
      send(client, 'initialized')
    }
  })
})

export default { handler: wss }
