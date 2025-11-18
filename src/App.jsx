import { BrowserRouter, Routes, Route } from "react-router-dom";
import Companies_details from "./comapnie";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Companies_details />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;