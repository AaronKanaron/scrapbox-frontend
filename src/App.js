import React from 'react'

// import Home from "./scenes/Home";
import Index from "./scenes/Index";
import SignUp from "./scenes/account/SignUp";
import Error404 from "./scenes/Error404";

// molecules
import Modal from "./components/molecules/Modal";

import "./styles/universal.scss";

import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route exact path="/" element={ <Home /> } /> */}
                <Route exact path="/" element={ <Index /> } />
                <Route exact path="/*" element={ <Error404 /> } />
                <Route exact path="/sign-up" element={ <SignUp /> } />
            </Routes>
        </BrowserRouter>
    );
}
