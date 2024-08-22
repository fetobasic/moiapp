import Config from 'App/Config/AppConfig';

// iOS specific thing to prevent screen freezing
export default (callback: () => void) => {
  setTimeout(callback, Config.genericModalDelay);
};
