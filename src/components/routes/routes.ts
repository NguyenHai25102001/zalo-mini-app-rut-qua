import HomePage from 'pages/index';
import AboutPage from 'pages/about';
import Gift from 'pages/gift';
import GiftRelative from 'pages/giftsRelative';

const routes = [
    {
        path: "/",
        element: HomePage
    },
    {
        path: "/about",
        element: AboutPage
    }, {
        path: '/gift',
        element: Gift
    },
    {
        path: '/gift-relatives',
        element: GiftRelative
    }

];

export { routes };