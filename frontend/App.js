import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import LoginScreen from "./loginScreen";
import RegisterScreen from "./registerScreen.jsx";

function App(){
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login"/>}/>
            <Route path="/login" component={LoginScreen} />
            <Route path="/register" component={RegisterScreen} />
            <Route path="*" element={<LoginScreen />} />
        </Routes>
    );
}

export default App;
