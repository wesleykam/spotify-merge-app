function authenticate() {
    window.location.replace('http://localhost:8888/login');
}

// async function getCode() {
//     const response = await fetch('/callback', {
//         method: 'GET', // *GET, POST, PUT, DELETE, etc.
//         headers: {
//             'Content-Type': 'text/html; charset=UTF-8'
//         },
//         body: text() // body data type must match "Content-Type" header
//     });
//     const key = await response.text();
//     console.log(key);
// }

