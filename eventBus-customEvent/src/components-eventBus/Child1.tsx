import React, { useEffect, useState } from "react"

interface StateProps {
  name: string
  dec: string
  count: number
}

const PERSON_INIT: StateProps = {
  name: "小明",
  dec: "Child1的CustomEvent自定义事件event-A",
  count: 0,
}

const ChildA: React.FC = () => {
  const [state, setState] = useState<StateProps>(PERSON_INIT)
  const [recevie, setRecevie] = useState()

  const eventRegister = (args: any) => {
    console.log("我是Child1，我接收到了来自Child2的消息：", args)
    setRecevie(args.detail)
  }

  useEffect(() => {
    // mount
    window.addEventListener("event-B", eventRegister)

    // unmount
    return () => {
      window.removeEventListener("event-B", eventRegister)
    }
  }, [])

  const sendMsgToChild2 = () => {
    // 创建事件
    const myEvent = new CustomEvent("event-A", { detail: state })
    // 派发事件
    window.dispatchEvent(myEvent)
  }

  return (
    <div>
      <h2>Child1</h2>
      <article>
        <p>state:</p>
        <pre>{JSON.stringify(state, null, 2)}</pre>
        <br />
        <p>event recevie:</p>
        <pre>{JSON.stringify(recevie, null, 2)}</pre>
        <br />
        <button onClick={() => setState((prev) => ({ ...prev, count: prev.count + 1 }))}>
          count + 1
        </button>
        <button onClick={sendMsgToChild2}>sendMsgToChild2</button>
      </article>
    </div>
  )
}

export default ChildA
