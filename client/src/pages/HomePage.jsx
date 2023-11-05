import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import { socket } from '../socket'
import { RightCircleOutlined, LeftCircleOutlined } from '@ant-design/icons'

function MessageCard({ type, message, dateTime, ...rest }) {
  return (
    <Card
      style={{ marginBottom: 20 }}
      bodyStyle={{ display: 'flex', alignItems: 'center' }}
      {...rest}
    >
      <pre style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
        <span>
          {type === 'i' ? <RightCircleOutlined /> : <LeftCircleOutlined />}
        </span>
        <span style={{ marginLeft: 10, marginRight: 10 }}>{message}</span>
        <Tag>{dateTime}</Tag>
      </pre>
    </Card>
  )
}

export default function HomePage() {
  const [device, setDevice] = useState(null)
  const [messages, setMessages] = useState([])
  const [isDeviceConnected, setDeviceConnected] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const inputRef = useRef(null)
  const formRef = useRef(null)
  const onSendMessage = (e) => {
    e.preventDefault()
    socket.emit('client-stream', {
      message: inputRef.current.input.value,
    })
    setMessages([
      ...messages,
      {
        content: inputRef.current.input.value,
        type: 'o',
        timestamp: new Date().toJSON(),
      },
    ])
    formRef.current.reset()
    inputRef.current.input.value = ''
  }
  const connectSocket = () => {
    socket.connect()
    socket.emit('client-init', {
      name: 'browser',
    })
  }
  const disconnectSocket = () => {
    socket.disconnect()
  }
  const onConnected = () => {
    setIsConnected(true)
  }
  const onDisconnected = () => {
    setIsConnected(false)
  }
  const onClientInit = ({ clientId }) => {
    localStorage.setItem('clientId', clientId)
  }
  const onClientStream = (data) => {
    switch (data.type) {
      case 'device-connected':
        setDevice(data.data)
        setDeviceConnected(true)
        return
      case 'device-message':
        for (let i = 0; i < data.data.length; i++) {
          data.data[i].type = 'i'
        }
        setMessages(data.data)
        return
      default:
        console.log(data)
        return
    }
  }

  useEffect(() => {
    socket.on('connect', onConnected)
    socket.on('disconnect', onDisconnected)
    socket.on('client-init', onClientInit)
    socket.on('client-stream', onClientStream)
  }, [])
  return (
    <div>
      {contextHolder}
      <Row
        gutter={20}
        style={{ marginTop: 50, marginLeft: 25, marginRight: 25 }}
      >
        <Col md={24} style={{ marginBottom: 20 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <Typography.Text strong style={{ marginRight: 10 }}>
                  Socket Server
                </Typography.Text>
                {isConnected ? (
                  <Tag color='success'>Connected</Tag>
                ) : (
                  <Tag>Disconnected</Tag>
                )}
              </div>
              <Button
                type='primary'
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  isConnected ? disconnectSocket() : connectSocket()
                }}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </Card>
        </Col>
        <Col md={24} style={{ marginTop: 20 }}>
          <Card>
            <form onSubmit={onSendMessage} ref={formRef}>
              <Input placeholder='Send Message to device' ref={inputRef} />
              <Button htmlType='submit'>Send Message</Button>
            </form>
          </Card>
        </Col>
        <Col md={24} style={{ marginTop: 20 }}>
          <Card bodyStyle={{ maxHeight: '100%', overflowY: 'auto' }}>
            <Typography.Text
              strong
              type={isDeviceConnected ? 'success' : 'danger'}
              style={{ display: 'block', marginRight: 10 }}
            >
              Device {isDeviceConnected ? 'Connected' : 'Disconnected'}
            </Typography.Text>
            <hr />
            {device !== null ? (
              <div>
                <Tag>{device?.id}</Tag>
                <hr />
              </div>
            ) : (
              ''
            )}
            {messages.length
              ? messages.map((m, i) => (
                  <MessageCard
                    key={i}
                    type={m.type}
                    message={m.content}
                    dateTime={m.timestamp}
                  />
                ))
              : ''}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
