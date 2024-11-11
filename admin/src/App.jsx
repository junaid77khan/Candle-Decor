import Admin from "./pages/Admin/Admin";
import { Provider } from "react-redux";
import { store } from "./store/store";

function App() {
  return (
    <Provider store={store}>
      <div >
        <Admin />
      </div>
    </Provider>
  );
}

export default App;
