// client-side js
// run by the browser each time your view template referencing it is loaded


// define variables that reference elements on our page
const birdsList = document.getElementById('birds');
const passList = document.getElementById('pass');
const failList = document.getElementById('fail');
const loading = document.getElementById('loading');
const birdsHeader = document.getElementById('birds-header');

birdsHeader.style.display = 'none';

const appendNewFail = fail => {
  const newListItem = document.createElement('li');
  newListItem.innerHTML = `❌ ${fail}`;
  failList.appendChild(newListItem);
};

const appendNewBird = bird => {
  const newListItem = document.createElement('li');
  newListItem.innerHTML = bird;
  birdsList.appendChild(newListItem);
}

const appendNewPass = pass => {
  const newListItem = document.createElement('li');
  newListItem.innerHTML = `✅ ${pass}`;
  passList.appendChild(newListItem);
}

const getBirdsListener = function() {
  // parse our response to convert to JSON
  const data = JSON.parse(this.responseText);
  const birds = data.birds;
  const fails = data.fail;
  const passes = data.pass;
  
  loading.style.display = 'none';
  birdsHeader.style.display = 'block';

  passes.forEach( function(pass) {
    appendNewPass(pass);
  });

  fails.forEach( function(fail) {
    appendNewFail(fail);
  });

  birds.forEach( function(row) {
    appendNewBird(row.comName);
  });
}
  
const birdsRequest = (lat, lng) => {
  const birdRequest = new XMLHttpRequest();
  birdRequest.onload = getBirdsListener;
  birdRequest.open('get', `/birds/local?lat=${lat}&lng=${lng}`, true);
  birdRequest.send();
};
  
navigator.geolocation.getCurrentPosition(position =>
  birdsRequest(position.coords.latitude, position.coords.longitude)
);
