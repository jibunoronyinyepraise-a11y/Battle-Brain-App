import { RouterProvider } from "react-router-dom";
import "./App.css";
import MainRouter from "./Router/MainRouter";

function App() {
  return (
    <>
      <RouterProvider router={MainRouter} />
    </>
  );
}

export default App;
