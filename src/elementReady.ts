export const elementReady = (selector: string, document: Document | ShadowRoot) => {
  return new Promise((resolve, _reject) => {
    let el = document.querySelector(selector);
    if (el) {
      resolve(el); 
      return
    }
    new MutationObserver((_mutationRecords, observer) => {
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
        resolve(element);
        observer.disconnect();
      });
    })
      .observe(document, {
        childList: true,
        subtree: true
      });
  });
}