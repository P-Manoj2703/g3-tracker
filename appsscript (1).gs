var PHONE = '91XXXXXXXXXX';
var API_KEY = 'YOUR_CALLMEBOT_API_KEY';

var SHEETS = {
  entries:   'Entries',
  vendors:   'Vendors',
  sales:     'Sales',
  land:      'Land',
  documents: 'Documents',
  capital:   'Capital',
};

var HEADERS = {
  entries:   ['ID','Date','Category','Amount','PaymentMode','VendorName','FlatNo','Note','PhotoURL','GPS','SubmittedBy','Role','Timestamp','EditedAt'],
  vendors:   ['ID','VendorName','Type','InvoiceNo','InvoiceDate','InvoiceAmount','PaidAmount','Balance','PhotoURL','Note','Timestamp'],
  sales:     ['ID','FlatNo','BuyerName','SaleValue','ReceivedAmount','Balance','PaymentDate','PaymentMode','Note','ReceiptURL','Timestamp'],
  land:      ['ID','SiteID','Category','Amount','PaymentMode','Note','PhotoURL','GPS','Timestamp'],
  documents: ['ID','LinkedTo','DocType','FileURL','UploadedBy','Timestamp'],
  capital:   ['ID','PartnerName','Amount','Date','PaymentMode','Note','Timestamp'],
};

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function(key) {
    var name = SHEETS[key];
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(HEADERS[key]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS[key].length).setFontWeight('bold');
    }
  });
}

function doPost(e) {
  try {
    setupSheets();
    var params = e.parameter;
    var type = params.type || 'entry';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var photoUrl = '';
    var now = new Date().toISOString();

    if (params.photoData && params.photoData.length > 0) {
      var folder = getOrCreateFolder('G3 Builders Photos');
      var blob = Utilities.newBlob(
        Utilities.base64Decode(params.photoData),
        params.photoMime || 'image/jpeg',
        params.photoName || ('photo-' + params.id + '.jpg')
      );
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoUrl = 'https://drive.google.com/file/d/' + file.getId() + '/view';
    }

    if (type === 'entry') {
      var sheet = ss.getSheetByName(SHEETS.entries);
      sheet.appendRow([
        params.id,
        params.date,
        params.category,
        params.amount,
        params.paymentMode,
        params.vendorName,
        params.flatNo || '',
        params.note,
        photoUrl,
        params.gps || '',
        params.submittedBy,
        params.role || 'supervisor',
        now,
        ''
      ]);
      var amount = parseInt(params.amount);
      if (amount >= 25000) { sendAlert('ENTRY', params, amount); }
    }

    else if (type === 'vendor') {
      var sheet = ss.getSheetByName(SHEETS.vendors);
      var invoiceAmt = parseFloat(params.invoiceAmount) || 0;
      var paidAmt = parseFloat(params.paidAmount) || 0;
      sheet.appendRow([
        params.id,
        params.vendorName,
        params.vendorType || '',
        params.invoiceNo || '',
        params.invoiceDate || '',
        invoiceAmt,
        paidAmt,
        invoiceAmt - paidAmt,
        photoUrl,
        params.note || '',
        now
      ]);
      if (paidAmt >= 25000) { sendAlert('VENDOR', params, paidAmt); }
    }

    else if (type === 'sale') {
      var sheet = ss.getSheetByName(SHEETS.sales);
      var saleVal = parseFloat(params.saleValue) || 0;
      var received = parseFloat(params.receivedAmount) || 0;
      sheet.appendRow([
        params.id,
        params.flatNo,
        params.buyerName,
        saleVal,
        received,
        saleVal - received,
        params.paymentDate || '',
        params.paymentMode || '',
        params.note || '',
        photoUrl,
        now
      ]);
      sendAlert('SALE', params, received);
    }

    else if (type === 'land') {
      var sheet = ss.getSheetByName(SHEETS.land);
      sheet.appendRow([
        params.id,
        params.siteId || '',
        params.category || '',
        params.amount,
        params.paymentMode || '',
        params.note || '',
        photoUrl,
        params.gps || '',
        now
      ]);
      sendAlert('LAND', params, parseInt(params.amount));
    }

    else if (type === 'document') {
      var sheet = ss.getSheetByName(SHEETS.documents);
      sheet.appendRow([
        params.id,
        params.linkedTo || '',
        params.docType || '',
        photoUrl,
        params.uploadedBy || '',
        now
      ]);
    }

    else if (type === 'capital') {
      var sheet = ss.getSheetByName(SHEETS.capital);
      sheet.appendRow([
        params.id,
        params.partnerName,
        params.amount,
        params.date || '',
        params.paymentMode || '',
        params.note || '',
        now
      ]);
      sendAlert('CAPITAL', params, parseInt(params.amount));
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', id: params.id, photoUrl: photoUrl }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  setupSheets();
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'getEntries')   { return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.entries))); }
  if (action === 'getVendors')   { return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.vendors))); }
  if (action === 'getSales')     { return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.sales))); }
  if (action === 'getLand')      { return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.land))); }
  if (action === 'getDocuments') { return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.documents))); }
  if (action === 'getCapital')   { return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.capital))); }

  if (action === 'getAll') {
    return jsonResponse({
      entries:   getSheetData(ss.getSheetByName(SHEETS.entries)),
      vendors:   getSheetData(ss.getSheetByName(SHEETS.vendors)),
      sales:     getSheetData(ss.getSheetByName(SHEETS.sales)),
      land:      getSheetData(ss.getSheetByName(SHEETS.land)),
      documents: getSheetData(ss.getSheetByName(SHEETS.documents)),
      capital:   getSheetData(ss.getSheetByName(SHEETS.capital)),
    });
  }

  return jsonResponse({ status: 'ok' });
}

function getSheetData(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r) { return r[0]; }).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      obj[h.toLowerCase().replace(/\s+/g, '')] = row[i];
    });
    return obj;
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(name);
}

function sendAlert(type, params, amount) {
  var msg = '';
  var amt = '₹' + Math.round(amount).toLocaleString('en-IN');

  if (type === 'ENTRY') {
    msg = '🔔 G3 Entry\n' + amt + '\n' + (params.category||'') + ' — ' + (params.vendorName||'') + '\nBy: ' + (params.submittedBy||'') + '\nRef: ' + params.id;
  } else if (type === 'VENDOR') {
    msg = '🧾 Vendor Payment\n' + amt + '\n' + (params.vendorName||'') + '\nInvoice: ' + (params.invoiceNo||'') + '\nRef: ' + params.id;
  } else if (type === 'SALE') {
    msg = '🏠 Sale Payment\n' + amt + '\nFlat: ' + (params.flatNo||'') + '\nBuyer: ' + (params.buyerName||'') + '\nRef: ' + params.id;
  } else if (type === 'LAND') {
    msg = '🏕️ Land Payment\n' + amt + '\n' + (params.category||'') + '\nRef: ' + params.id;
  } else if (type === 'CAPITAL') {
    msg = '💰 Capital Deposit\n' + amt + '\nPartner: ' + (params.partnerName||'') + '\nRef: ' + params.id;
  }

  var url = 'https://api.callmebot.com/whatsapp.php?phone=' + PHONE + '&text=' + encodeURIComponent(msg) + '&apikey=' + API_KEY;
  try { UrlFetchApp.fetch(url); } catch(e) {}
}

function weeklySummary() {
  setupSheets();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var entries = getSheetData(ss.getSheetByName(SHEETS.entries));
  var sales   = getSheetData(ss.getSheetByName(SHEETS.sales));
  var capital = getSheetData(ss.getSheetByName(SHEETS.capital));
  var now = new Date();
  var weekAgo = new Date(now.getTime() - 7*24*60*60*1000);

  var wExp = entries.filter(function(e){ return new Date(e.timestamp) >= weekAgo; });
  var wSal = sales.filter(function(s){ return new Date(s.timestamp) >= weekAgo; });
  var wCap = capital.filter(function(c){ return new Date(c.timestamp) >= weekAgo; });

  var totalExp = wExp.reduce(function(s,e){ return s+(parseFloat(e.amount)||0); }, 0);
  var totalSal = wSal.reduce(function(s,e){ return s+(parseFloat(e.receivedamount)||0); }, 0);
  var totalCap = wCap.reduce(function(s,e){ return s+(parseFloat(e.amount)||0); }, 0);

  var msg = '📊 G3 Weekly Summary\nWeek ending ' + now.toLocaleDateString('en-IN') + '\n\n'
    + 'Expenses: ₹' + Math.round(totalExp).toLocaleString('en-IN') + ' (' + wExp.length + ' entries)\n'
    + 'Sales: ₹' + Math.round(totalSal).toLocaleString('en-IN') + ' (' + wSal.length + ' payments)\n'
    + 'Capital in: ₹' + Math.round(totalCap).toLocaleString('en-IN') + '\n'
    + 'Net: ₹' + Math.round(totalSal + totalCap - totalExp).toLocaleString('en-IN');

  var url = 'https://api.callmebot.com/whatsapp.php?phone=' + PHONE + '&text=' + encodeURIComponent(msg) + '&apikey=' + API_KEY;
  try { UrlFetchApp.fetch(url); } catch(e) {}
}
