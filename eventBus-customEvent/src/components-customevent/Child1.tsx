import React, { useEffect, useState } from "react"
import EventBus from "../utils/eventBus"

interface StateProps {
  name: string
  age: number
  count: number
}

const PERSON_INIT: StateProps = {
  name: "小明",
  age: 18,
  count: 0,
}

const ChildA: React.FC = () => {
  const [state, setState] = useState<StateProps>(PERSON_INIT)
  const [recevie, setRecevie] = useState()

  const eventRegister = (args: any) => {
    console.log("我是Child1，我接收到了来自Child2的消息：", args)
    setRecevie(args)
  }

  useEffect(() => {
    // mount
    EventBus.on("msgTochild1", eventRegister)

    // unmount
    return () => {
      EventBus.off("msgTochild1", eventRegister)
    }
  }, [])

  const sendMsgToChild2 = () => {
    EventBus.emit("msgTochild2", state)
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
