function getCredentials(callbackFunction) {
  var data = {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
  };
  var url = 'https://api.clarifai.com/v1/token';

  return axios.post(url, data, {
    'transformRequest': [
      function() {
        return transformDataToParams(data);
      }
    ]
  }).then(function(r) {
    localStorage.setItem('accessToken', r.data.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    callbackFunction();
  }, function(err) {
    console.log(err);
  });
}

function transformDataToParams(data) {
  var str = [];
  for (var p in data) {
    if (data.hasOwnProperty(p) && data[p]) {
      if (typeof data[p] === 'string'){
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
      }
      if (typeof data[p] === 'object'){
        for (var i in data[p]) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p][i]));
        }
      }
    }
  }
  return str.join('&');
}

//The getCredentials() function first builds an object called data, and that 
// object has your Client ID and Client Secret, and labels itself as client 
// credentials.  Then, we have a variable url that has our endpoint URL,   
// And then finally, we use axios to make a POST request where we pass in our data and our url, and we call transformDataToParams().

function postImage(imgurl) {
  var accessToken = localStorage.getItem('accessToken');
  var data = {
    'url': imgurl
  };
  var url = 'https://api.clarifai.com/v1/tag';
  return axios.post(url, data, {
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function(r) {
    parseResponse(r.data);
  }, function(err) {
    console.log('Sorry, something is wrong: ' + err);
  });
}
// Above: Our function first takes in imgurl (which is just a variable name for image URL), 
// then it gets the access token from local storage and assigns it to a variable.  
// Then we make a data object with the passed in imgurl variable, and finally we 
// make a url variable again only this time, it’s linking to the /v1/tag endpoint.  
// We shove all of this into another axios call, where we pass in url, data, and 
// we make a headers object that uses the access token. 

function parseResponse(resp) {
  var tags = [];
  if (resp.status_code === 'OK') {
    var results = resp.results;
    tags = results[0].result.tag.classes;
  } else {
    console.log('Sorry, something is wrong.');
  }document.getElementById('tags').innerHTML = tags.toString().replace(/,/g, ', ');       
  return tags;
}
//This function takes in an image URL, then checks if there’s an expired/nonexistent access token
function run(imgurl) {
  if (Math.floor(Date.now() / 1000) - localStorage.getItem('tokenTimeStamp') > 86400 || localStorage.getItem('accessToken') === null) {
   getCredentials(function() {
   postImage(imgurl);
   });
  }
}