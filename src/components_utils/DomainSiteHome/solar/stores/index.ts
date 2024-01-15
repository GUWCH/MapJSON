import { createContext, useContext } from 'react';
import store from './store';

// function getStores(files) {
//   const stores = {};
//   const keys = files.keys();

//   keys.forEach(k => {
//     if (/\/index.(js|ts)$/.test(k)) return;

//     const match = k.match(/\.\/([a-zA-Z0-9]*)*\./);
//     if (!!match && match.length >= 1) {
//       const storeName = match[1];
//       stores[storeName] = files(k).default || files(k);
//     }
//   });

//   return stores;
// }
// for class
// const StoresContext = createContext(getStores(require.context('./', false, /\.(ts|js)$/)));
const StoresContext = createContext({ store });

// for FC
export const useStores = () => useContext(StoresContext);

export default StoresContext;