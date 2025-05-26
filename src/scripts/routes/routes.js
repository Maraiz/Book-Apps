import HomePage from '../pages/landing/home-page';
import DashboardPage from '../pages/home/dashboard-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import AddPage from '../pages/add/add-page';

const routes = {
  '/': new HomePage(),
  '/register': new RegisterPage(),
  '/login': new LoginPage(),
  '/dashboard': new DashboardPage(),
  '/addstory': new AddPage(),
};

export default routes;
