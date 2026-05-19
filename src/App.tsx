import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import ECommerce from './pages/Dashboard/ECommerce';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import GradeStudents from './pages/Evaluation/Grades/GradeStudents';
import Loader from './common/Loader';
import routes from './routes';
import { store } from './store/store';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import RoleGuard from './components/Auth/RoleGuard';
import Unauthorized from './pages/Unauthorized';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <Provider store={store}>
      <>
        <Toaster
          position="top-right"
          reverseOrder={false}
          containerClassName="overflow-auto"
        />
        <Routes>
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute />}>
            <Route element={
              <Suspense fallback={<Loader />}>
                <DefaultLayout />
              </Suspense>
            }>
              <Route index element={<ECommerce />} />
              <Route
                path="/evaluation/grades/:evaluationId"
                element={
                  <Suspense fallback={<Loader />}>
                    <GradeStudents />
                  </Suspense>
                }
              />
              {routes.map((route, index) => {
                const { path, component: Component, requiredRoles } = route;
                return (
                  <Route
                    key={index}
                    path={path}
                    element={
                      <Suspense fallback={<Loader />}>
                        {requiredRoles ? (
                          <RoleGuard allowedRoles={requiredRoles}>
                            <Component />
                          </RoleGuard>
                        ) : (
                          <Component />
                        )}
                      </Suspense>
                    }
                  />
                );
              })}
            </Route>
          </Route>
        </Routes>
      </>
    </Provider>
  );
}

export default App;


