import React from "react"
import Child1 from "./Child1"
import Child2 from "./Child2"

const Parent: React.FC = () => {
  return (
    <div className="parent-container">
      <div className="content-box">
        <Child1 />
        <Child2 />
      </div>
    </div>
  )
}

export default Parent
