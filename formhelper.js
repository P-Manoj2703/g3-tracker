// formhelper.js — shared submit function for all forms
// Step 1: Send form data via GET (fast, no photo)
// Step 2: If photo attached, upload via POST separately

async function submitToSheet(params, photoFile, sheetName) {
  var ID = params.get('id');

  // Step 1 — Send form data via GET (no photo)
  var submitUrl = CONFIG.sheetURL + '?' + params.toString();
  await fetch(submitUrl, { mode: 'no-cors' });

  // Step 2 — If photo attached, upload separately via POST
  if (photoFile) {
    try {
      var photoData = await new Promise(function(res, rej) {
        var reader = new FileReader();
        reader.onload = function() { res(reader.result.split(',')[1]); };
        reader.onerror = rej;
        reader.readAsDataURL(photoFile);
      });

      var photoParams = new URLSearchParams({
        type: 'photo',
        rowId: ID,
        sheetName: sheetName,
        photoData: photoData,
        photoMime: photoFile.type,
        photoName: photoFile.name
      });

      await fetch(CONFIG.sheetURL, {
        method: 'POST',
        body: photoParams,
        mode: 'no-cors'
      });
    } catch(err) {
      console.log('Photo upload failed:', err);
    }
  }

  return { status: 'ok', id: ID };
}
