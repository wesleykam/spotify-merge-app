let access_token = null;

let playlists = [];
let selected_items = [];
let new_playlist_id = null;

function onPageLoad() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = "merge";
    btn.name = "Merge_Playlists";
    btn.innerText = 'Merge';
    btn.addEventListener('click', function onClick() {
        if (selected_items.length > 1) {
            createPlaylist();
            //window.location.replace('https://spotify-playlist-merge.herokuapp.com/result.html');
        } 
    });
    document.getElementById('merge_instructions').appendChild(btn);
    saveTokens();
    getPlaylists();
}

function saveTokens() {
    const queryString = window.location.search;
    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        access_token = urlParams.get('access_token');
    }
    localStorage.setItem('access_token', access_token);
}

async function getPlaylists() {
    const api_url = 'https://api.spotify.com/v1/me/playlists';

    let body = {
        'headers': {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    };
    
    const response = await fetch(api_url, body);
    const json = await response.json();
    // console.log(json);
    playlists = json.items;

    displayPlaylists();
}

function displayPlaylists() {
    let pos = 'left';
    let row = '';
    let rowCount = 0;

    for (let i = 0; i < playlists.length; i++) {

        if (pos == 'left') {
            row = 'row' + rowCount;
            rowCount++;
            let rowDiv = document.createElement('div');
            rowDiv.id = row;
            rowDiv.className = 'row';
            document.body.appendChild(rowDiv);
        }


        let colDiv = document.createElement('div');
        colDiv.id = pos + row;
        colDiv.className = pos + ' col';
        document.getElementById(row).appendChild(colDiv);

        const newDiv = document.createElement('div');
        newDiv.className = 'Playlist_Name';
        // and give it some content
        const newContent = document.createTextNode(playlists[i].name);
        // add the text node to the newly created div
        newDiv.appendChild(newContent);
        document.getElementById(pos + row).appendChild(newDiv);

        // create img element for playlist cover
        var img = document.createElement('img');
        img.src = playlists[i].images[0].url;
        img.width = 100;
        img.height = 100;
        document.getElementById(pos + row).appendChild(img);

        const linebreak = document.createElement('br');
        document.getElementById(pos + row).appendChild(linebreak);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'select';
        btn.name = playlists[i].id;
        btn.addEventListener('click', function onClick() {
            if (btn.style.backgroundColor == 'green') {
                btn.style.backgroundColor = 'rgb(219, 219, 219)';
                var index = selected_items.indexOf(btn.getAttribute('name'));
                selected_items.splice(index, 1);
                //console.log(selected_items);
            }
            else {
                btn.style.backgroundColor = 'green';
                selected_items.push(btn.getAttribute('name'));
                //console.log(selected_items);
            }
        });
        document.getElementById(pos + row).appendChild(btn);

        if (pos == 'left') {
            pos = 'center';
        }
        else if (pos == 'center') {
            pos = 'right';
        }
        else {
            pos = 'left';
        }
    }
}

function createPlaylist() {
    const api_url = 'https://api.spotify.com/v1/me/playlists';

    let data = {
        'name': 'Merged_Playlist',
    }

    let body = {
        'method': 'POST',
        'headers': {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(data)
    };

    // const response = await fetch(api_url, body);
    // const json = await response.json();

    fetch(api_url, body).then((response) => {
        response.json().then((data) => {
            new_playlist_id = data.id;
            addSongs();
        });
    });
}

function addSongs() {
    for (let i = 0; i < selected_items.length; i++) {
        let playlist_id = selected_items[i];
        let offset = 0;
        let curr_size = 100;
        let add_uris = [];

        while (offset < curr_size) {
            let fetch_api_url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?fields=total,items.track.id&limit=100&offset=${offset}`

            let fetch_body = {
                'headers': {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type': 'application/json'
                },
            };
            
            fetch(fetch_api_url, fetch_body).then((response) => {
                response.json().then((data) => {
                    tracks = data;
                });
            });

            // const response = await fetch(fetch_api_url, fetch_body);
            // const tracks = await response.json();


            curr_size = tracks.total;
            let curr_songs = tracks.items;

            for (let j = 0; j < curr_songs.length; j++) {
                let song_uri = 'spotify:track:' + curr_songs[j].track.id;
                    
                add_uris.push(song_uri);
            }
            
            if (add_uris.length > 0) {
                let add_api_url = `https://api.spotify.com/v1/playlists/${new_playlist_id}/tracks`;
                //console.log(add_api_url);
                //console.log(add_uris);
                let add_data = {
                    'uris': add_uris
                };

                let add_body = {
                    'method': 'POST',
                    'headers': {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-Type': 'application/json'
                    },
                    'body': JSON.stringify(add_data)
                };
                
                fetch(add_api_url, add_body);
                //const add_response = await fetch(add_api_url, add_body);
                //let add_json = await add_response.json();
            }
            
            add_uris = [];
            offset += 100;
        }
        // add_tracks(add_uris);
    }
}

// async function add_tracks(add_uris) {
//     let api_url = `https://api.spotify.com/v1/playlists/${new_playlist_id}/tracks`;

//     let data = {
//         'uris': add_uris
//     };

//     let body = {
//         'method': 'POST',
//         'headers': {
//             'Authorization': 'Bearer ' + access_token,
//             'Content-Type': 'application/json'
//         },
//         'body': JSON.stringify(data)
//     };

//     const response = await fetch(api_url, body);
//     const json = await response.json();
// }

// async function callAPI(method, url, body) {
    
    
// }