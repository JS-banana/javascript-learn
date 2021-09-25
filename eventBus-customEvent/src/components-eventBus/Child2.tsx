import React, { useEffect, useState } from "react"

interface ListProps {
  name: string
  dec: string
  count: number
}

const LIST_INIT: ListProps[] = [
  {
    name: "小李",
    dec: "Child2的CustomEvent自定义事件event-B",
    count: 0,
  },
]

const ChildB: React.FC = () => {
  const [list, setlist] = useState<ListProps[]>(LIST_INIT)
  const [recevie, setRecevie] = useState()

  const eventRegister = (args: any) => {
    console.log("我是Child2，我接收到了来自Child1的消息：", args)
    setRecevie(args.detail)
  }

  useEffect(() => {
    // mount
    window.addEventListener("event-A", eventRegister)

    // unmount
    return () => {
      window.removeEventListener("event-A", eventRegister)
    }
  }, [])

  const sendMsgToChild1 = () => {
    // 创建事件
    const myEvent = new CustomEvent("event-B", { detail: list })
    // 派发事件
    window.dispatchEvent(myEvent)
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
        <button
          onClick={() =>
            setlist((prev) => [
              ...prev,
              { name: "小李", dec: "Child2的CustomEvent自定义事件event-B", count: 0 },
            ])
          }
        >
          person list + 1
        </button>
        <button onClick={sendMsgToChild1}>sendMsgToChild1</button>
      </article>
    </div>
  )
}

export default ChildB
