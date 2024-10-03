import React from "react";
import { Route } from "react-router-dom";
import { App, ZMPRouter, AnimationRoutes, SnackbarProvider } from "zmp-ui";
import { RecoilRoot } from "recoil";
import { routes } from "./routes/routes";
import "../css/global.css";
import { AppProvider } from "./context/MyContext";

const MyApp = () => {
  return (
    <RecoilRoot>
      <App>
        <SnackbarProvider>
          <AppProvider>
            <ZMPRouter>
              <AnimationRoutes>
                {
                  routes.map((route, index) => {
                    return (
                      <Route key={index} path={route.path} element={<route.element />}></Route>
                    );
                  }
                  )}
              </AnimationRoutes>
            </ZMPRouter>
          </AppProvider>
        </SnackbarProvider>
      </App>
    </RecoilRoot>
  );
};
export default MyApp;
