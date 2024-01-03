[![Continuous Integration](https://github.com/kaiosilveira/move-statements-into-callers-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/move-statements-into-callers-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Move Statements into Callers

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
emitPhotoData(outStream, person.photo);

function emitPhotoData(otStream, photo) {
  outStream.write(`<p>title: ${photo.title}</p>\n`);
  outStream.write(`<p>location: ${photo.location}</p>\n`);
}
```

</td>

<td>

```javascript
emitPhotoData(outStream, person.photo);
outStream.write(`<p>location: ${photo.location}</p>\n`);

function emitPhotoData(outStream, photo) {
  outStream.write(`<p>title: ${photo.title}</p>\n`);
}
```

</td>
</tr>
</tbody>
</table>

**Inverse of: [Move Statements into Function](https://github.com/kaiosilveira/move-statements-into-function-refactoring)**

Programmers like encapsulating things that make sense going together, as encapsulation promotes reuse, and as we all know, the premise of reuse is at least a good excuse to have code well-factored in small logical chunks. Sometimes, though, we don't get our boundaries right at first and we need to modify our function's behavior slightly here and there. This refactoring helps in these cases.

## Working example

Our working example is a small markup generation system that writes some user data to a writable stream. In our current context, we want to have a slightly different markup rendering for the `renderPerson` and `listRecentPhotos` functions, so we need to modify the underlying `emitPhotoData` to support it.

### Test suite

The test suite put in place for this example directly covers the two main functions mentioned above, plus the `emitPhotoData` function indirectly.

```javascript
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
```

### Steps

We start by extracting the photo title and date into a separate function:

```diff
diff --git a/src/index.js b/src/index.js
@@ -15,9 +15,13 @@
export function listeRecentPhotos(outStream, photos) {
 }

 function emitPhotoData(outStream, photo) {
+  zztemp(outStream, photo);
+  outStream.write(`<p>location: ${photo.location}</p>\n`);
+}
+
+function zztemp(outStream, photo) {
   outStream.write(`<p>title: ${photo.title}</p>\n`);
   outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
-  outStream.write(`<p>location: ${photo.location}</p>\n`);
 }

 function recentDateCutoff() {
```

Then, we can start inlining `emitPhotoDate`. We start at `renderPerson`:

```diff
diff --git a/src/index.js b/src/index.js
@@ -1,7 +1,8 @@
 export function renderPerson(outStream, person) {
   outStream.write(`<p>${person.name}</p>\n`);
   renderPhoto(outStream, person.photo);
-  emitPhotoData(outStream, person.photo);
+  zztemp(outStream, person.photo);
+  outStream.write(`<p>location: ${person.photo.location}</p>\n`);
 }

 export function listeRecentPhotos(outStream, photos) {
```

And then at `listRecentPhotos`:

```diff
diff --git a/src/index.js b/src/index.js
@@ -10,7 +10,8 @@
export function listeRecentPhotos(outStream, photos) {
     .filter(p => p.date > recentDateCutoff())
     .forEach(p => {
       outStream.write(`<div>\n`);
-      emitPhotoData(outStream, p);
+      zztemp(outStream, p);
+      outStream.write(`<p>location: ${p.location}</p>\n`);
       outStream.write(`</div>\n`);
     });
 }
```

Then, we can remove the now unused `emitPhotoData`, effectively completing an ["Inline Function"](https://github.com/kaiosilveira/inline-function-refactoring) operation:

```diff
diff --git a/src/index.js b/src/index.js
@@ -16,11 +16,6 @@
export function listeRecentPhotos(outStream, photos) {
     });
 }

-function emitPhotoData(outStream, photo) {
-  zztemp(outStream, photo);
-  outStream.write(`<p>location: ${photo.location}</p>\n`);
-}
-
 function zztemp(outStream, photo) {
   outStream.write(`<p>title: ${photo.title}</p>\n`);
   outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
```

Finally, we can rename `zztemp` back to `emitPhotoData`, completing the refactoring:

```diff
diff --git a/src/index.js b/src/index.js
@@ -1,7 +1,7 @@
 export function renderPerson(outStream, person) {
   outStream.write(`<p>${person.name}</p>\n`);
   renderPhoto(outStream, person.photo);
-  zztemp(outStream, person.photo);
+  emitPhotoData(outStream, person.photo);
   outStream.write(`<p>location: ${person.photo.location}</p>\n`);
 }

@@ -10,13 +10,13 @@
export function listeRecentPhotos(outStream, photos) {
     .filter(p => p.date > recentDateCutoff())
     .forEach(p => {
       outStream.write(`<div>\n`);
-      zztemp(outStream, p);
+      emitPhotoData(outStream, p);
       outStream.write(`<p>location: ${p.location}</p>\n`);
       outStream.write(`</div>\n`);
     });
 }

-function zztemp(outStream, photo) {
+function emitPhotoData(outStream, photo) {
   outStream.write(`<p>title: ${photo.title}</p>\n`);
   outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
 }
```

And that's it!

### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                          | Message                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [1ba766e](https://github.com/kaiosilveira/move-statements-into-callers-refactoring/commit/1ba766ebe92efea31e8161e76110524616008452) | extract photo title and date into a separate fn |
| [7cbb2e5](https://github.com/kaiosilveira/move-statements-into-callers-refactoring/commit/7cbb2e575e0d0f5c9faa2730ee3bde9448fa74d6) | inline `emitPhotoDate` at `renderPerson`        |
| [d23ec4d](https://github.com/kaiosilveira/move-statements-into-callers-refactoring/commit/d23ec4d5c054adfdab635ebf2f994194d672b870) | inline `emitPhotoDate` at `listRecentPhotos`    |
| [49f4dbd](https://github.com/kaiosilveira/move-statements-into-callers-refactoring/commit/49f4dbd12de9dfbeb2fbabc6fd05994ea68c13bb) | remove unused `emitPhotoData`                   |
| [aa37e2f](https://github.com/kaiosilveira/move-statements-into-callers-refactoring/commit/aa37e2f71b378a0e7beba5c57a6ffbc3626e70e9) | rename `zztemp` back to `emitPhotoData`         |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/move-statements-into-callers-refactoring/commits/main).
