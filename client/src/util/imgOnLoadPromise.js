// Helper for loading images to the report
export function imgOnLoadPromise(obj) {
  return new Promise((resolve, reject) => {
    obj.onload = () => resolve(obj);
    obj.onerror = reject;
  });
}
