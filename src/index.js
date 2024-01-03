export function renderPerson(outStream, person) {
  outStream.write(`<p>${person.name}</p>\n`);
  renderPhoto(outStream, person.photo);
  zztemp(outStream, person.photo);
  outStream.write(`<p>location: ${person.photo.location}</p>\n`);
}

export function listeRecentPhotos(outStream, photos) {
  photos
    .filter(p => p.date > recentDateCutoff())
    .forEach(p => {
      outStream.write(`<div>\n`);
      zztemp(outStream, p);
      outStream.write(`<p>location: ${p.location}</p>\n`);
      outStream.write(`</div>\n`);
    });
}

function zztemp(outStream, photo) {
  outStream.write(`<p>title: ${photo.title}</p>\n`);
  outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
}

function recentDateCutoff() {
  return new Date(2019, 0, 1);
}

function renderPhoto(outStream, _photo) {
  outStream.write(`<p>🌃</p>\n`);
}
