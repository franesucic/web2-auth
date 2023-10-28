import Body from "./components/Body";
import Tournament from "./tournament";
import { useAuth0 } from "@auth0/auth0-react";
import "../src/App.css"
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

function App() {
  
  const { isLoading } = useAuth0()

  if (isLoading) return <div>Loading...</div>

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Body/>}/>
        <Route path="/tour" element={<Tournament/>} />
      </Routes>
    </Router>
  );
}

export default App;
