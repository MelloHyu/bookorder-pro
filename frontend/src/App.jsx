import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000")
      .then(res => res.text())
      .then(data => console.log("Backend says:", data))
      .catch(err => console.error(err));
  }, []);

  return <h1>BookOrder Pro</h1>;
}

export default App;