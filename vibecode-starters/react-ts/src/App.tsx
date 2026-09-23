import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1>⚡ Welcome to VibeCode!</h1>
      <p>Start editing <code>src/App.tsx</code> to build something awesome.</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Count is: {count}
        </button>
      </div>
    </div>
  )
}
