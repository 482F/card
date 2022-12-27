import WebSocket from 'ws'

const wss = new WebSocket.Server({
  port: 18245,
  host: 'localhost',
})

// 接続処理
wss.on('connection', (client) => {
  // クライアントからのリクエストを受け取った際の処理
  client.on('message', (rawMessage) => {
    // 送信元を含むすべてのWebSocket接続済みクライアントに送信
    const message = new TextDecoder().decode(rawMessage)
    ;[...wss.clients]
      .filter((someClient) => someClient !== client)
      .forEach((client) => {
        client.send(message)
      })
  })
})

export default { handler: wss }
