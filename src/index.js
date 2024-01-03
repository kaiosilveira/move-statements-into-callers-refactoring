export function renderPerson(outStream, person) {
  outStream.write(`<p>${person.name}</p>\n`);
  renderPhoto(outStream, person.photo);
  emitPhotoData(outStream, person.photo);
}

export function listeRecentPhotos(outStream, photos) {
  photos
    .filter(p => p.date > recentDateCutoff())
    .forEach(p => {
      outStream.write(`<div>\n`);
      emitPhotoData(outStream, p);
      outStream.write(`</div>\n`);
    });
}

function emitPhotoData(outStream, photo) {
  outStream.write(`<p>title: ${photo.title}</p>\n`);
  outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
  outStream.write(`<p>location: ${photo.location}</p>\n`);
}

function recentDateCutoff() {
  return new Date(2019, 0, 1);
}

function renderPhoto(outStream, _photo) {
  outStream.write(`<p>🌃</p>\n`);
}
