import { jest } from '@jest/globals';
import { listeRecentPhotos, renderPerson } from '.';

describe('renderPerson', () => {
  it('should render the correct markup', () => {
    const photo = { title: 'My Photo', location: 'Paris', date: new Date(2020, 0, 1) };
    const person = { name: 'John Doe', photo };
    const outStream = { write: jest.fn() };

    renderPerson(outStream, person);

    expect(outStream.write).toHaveBeenCalledTimes(5);
    expect(outStream.write).toHaveBeenCalledWith(`<p>John Doe</p>\n`);
    expect(outStream.write).toHaveBeenCalledWith(`<p>🌃</p>\n`);
    expect(outStream.write).toHaveBeenCalledWith(`<p>title: My Photo</p>\n`);
    expect(outStream.write).toHaveBeenCalledWith(`<p>date: Wed Jan 01 2020</p>\n`);
    expect(outStream.write).toHaveBeenCalledWith(`<p>location: Paris</p>\n`);
  });
});

describe('listRecentPhotos', () => {
  it('should render the correct markup', () => {
    const outStream = { write: jest.fn() };
    const photos = [
      { title: 'Photo 1', location: 'Paris', date: new Date(2020, 0, 1) },
      { title: 'Photo 2', location: 'Paris', date: new Date(2019, 0, 1) },
      { title: 'Photo 3', location: 'Paris', date: new Date(2018, 0, 1) },
    ];

    listeRecentPhotos(outStream, photos);

    expect(outStream.write).toHaveBeenCalledTimes(5);
    expect(outStream.write).toHaveBeenCalledWith(`<div>\n`);
    expect(outStream.write).toHaveBeenCalledWith(`<p>title: Photo 1</p>\n`);
    expect(outStream.write).toHaveBeenCalledWith(`<p>date: Wed Jan 01 2020</p>\n`);
    expect(outStream.write).toHaveBeenCalledWith(`<p>location: Paris</p>\n`);
    expect(outStream.write).toHaveBeenCalledWith(`</div>\n`);
  });
});
