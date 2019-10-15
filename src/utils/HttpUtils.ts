import { Cookies } from 'react-cookie';

const HOST = 'http://47.99.138.248';

const cookies = new Cookies();
export function makeRequest(method: string, url: string) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function() {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
}

export function postData(url: string, data: object): Promise<any> {
  // Default options are marked with *
  return fetch(HOST + url, {
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    mode: 'cors',
    // credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      Authorization: cookies.get('token'),
      'content-type': 'application/json',
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
  }).then(response => response.json()); // parses response to JSON
}

export function getData(url: string): Promise<any> {
  // Default options are marked with *
  return fetch(HOST + url, {
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    mode: 'cors',
    // credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'content-type': 'application/json',
      Authorization: cookies.get('token'),
    },
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
  }).then(response => response.json()); // parses response to JSON
}
