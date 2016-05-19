import App from 'augur-ui-react-components';
import selectors from './selectors';

import { initAugur } from './modules/app/actions/init-augur';
import { showLink } from './modules/link/actions/show-link';
// import * as selectors from './selectors';

import store from './store';
const appElement = document.getElementById('app');

if (process.env.NODE_ENV === 'development') {
	Object.defineProperty(window, 'state', { get: store.getState, enumerable: true });
	window.selectors = selectors;
	window.App = App;
	console.log(`*********************************************
 DEVELOPMENT MODE
 window.selectors
 window.state
 window.augurjs
 *********************************************
`);
}

store.dispatch(showLink(window.location.pathname + window.location.search));
store.dispatch(initAugur());

// store.dispatch(MarketsActions.listenToMarkets());

store.subscribe(() => new App(appElement, selectors));

window.onpopstate = (e) => {
	store.dispatch(showLink(window.location.pathname + window.location.search));
};
