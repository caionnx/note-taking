export const generateNodeElement = html => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.firstElementChild;
};

// https://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this,
      args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
export const generateContentID = () => {
  const min = Math.ceil(0);
  const max = Math.floor(12487595);
  return Math.floor(Math.random() * (max - min)) + min;
};

/*!
 * Sanitize and encode all HTML in a user-submitted string
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String} str  The user-submitted string
 * @return {String} str  The sanitized string
 */
export const sanitizeHTML = str => {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
};
