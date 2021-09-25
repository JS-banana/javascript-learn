import React, { useEffect, useState } from "react"
import EventBus from "../utils/eventBus"

interface ListProps {
  name: string
  age: number
  count: number
}

const LIST_INIT: ListProps[] = [
  {
    name: "张三",
    age: 10,
    count: 0,
  },
]

const ChildB: React.FC = () => {
  const [list, setlist] = useState<ListProps[]>(LIST_INIT)
  const [recevie, setRecevie] = useState()

  const eventRegister = (args: any) => {
    console.log("我是Child2，我接收到了来自Child1的消息：", args)
    setRecevie(args)
  }

  useEffect(() => {
    // mount
    EventBus.on("msgTochild2", eventRegister)

    // unmount
    return () => {
      EventBus.off("msgTochild2", eventRegister)
    }
  }, [])

  const sendMsgToChild1 = () => {
    EventBus.emit("msgTochild1", list)
  }

  return (
    <div>
      <h2>Child2</h2>
      <article>
        <p>list:</p>
        <pre>{JSON.stringify(list, null, 2)}</pre>
        <br />
        <p>event recevie:</p>
        <pre>{JSON.stringify(recevie, null, 2)}</pre>
        <br />
        <button onClick={() => setlist((prev) => [...prev, { name: "小李", age: 11, count: 0 }])}>
          person list + 1
        </button>
        <button onClick={sendMsgToChild1}>sendMsgToChild1</button>
      </article>
    </div>
  )
}

export default ChildB
