var PHONE = '91XXXXXXXXXX';
var API_KEY = 'YOUR_CALLMEBOT_API_KEY';

var SHEETS = {
  expenses: 'Expenses',
  vendors:  'Vendors',
  sales:    'Sales',
};

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var expSheet = ss.getSheetByName(SHEETS.expenses);
  if (!expSheet) {
    expSheet = ss.insertSheet(SHEETS.expenses);
    expSheet.appendRow(['Ref','Timestamp','SubmittedBy','Category','Amount','Paymode','Vendor','Notes','GPS','PhotoURL','ServerTime']);
    expSheet.setFrozenRows(1);
  }
  var venSheet = ss.getSheetByName(SHEETS.vendors);
  if (!venSheet) {
    venSheet = ss.insertSheet(SHEETS.vendors);
    venSheet.appendRow(['InvoiceRef','Timestamp','VendorID','VendorName','InvoiceNo','InvoiceAmount','PaidAmount','PayDate','Paymode','Notes','PhotoURL','ServerTime']);
    venSheet.setFrozenRows(1);
  }
  var salSheet = ss.getSheetByName(SHEETS.sales);
  if (!salSheet) {
    salSheet = ss.insertSheet(SHEETS.sales);
    salSheet.appendRow(['PaymentRef','Timestamp','FlatID','BuyerName','BuyerPhone','AgreedAmount','ReceivedAmount','PayDate','Paymode','Stage','Notes','PhotoURL','ServerTime']);
    salSheet.setFrozenRows(1);
  }
}

function doPost(e) {
  try {
    setupSheets();
    var params = e.parameter;
    var type = params.type || 'expense';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var photoUrl = '';

    if (params.photoData && params.photoData.length > 0) {
      var folder = getOrCreateFolder('G3 Builders Photos');
      var blob = Utilities.newBlob(
        Utilities.base64Decode(params.photoData),
        params.photoMime || 'image/jpeg',
        params.photoName || ('photo-' + params.ref + '.jpg')
      );
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoUrl = 'https://drive.google.com/file/d/' + file.getId() + '/view';
    }

    if (type === 'expense') {
      var sheet = ss.getSheetByName(SHEETS.expenses);
      sheet.appendRow([
        params.ref, params.timestamp, params.submittedBy,
        params.category, params.amount, params.paymode,
        params.vendor, params.notes, params.gps, photoUrl,
        new Date().toISOString()
      ]);
      var amount = parseInt(params.amount);
      if (amount >= 25000) { sendAlert('EXPENSE', params, amount); }
    }

    else if (type === 'vendor') {
      var sheet = ss.getSheetByName(SHEETS.vendors);
      sheet.appendRow([
        params.ref, params.timestamp, params.vendorId,
        params.vendorName, params.invoiceNo, params.invoiceAmount,
        params.paidAmount, params.payDate, params.paymode,
        params.notes, photoUrl, new Date().toISOString()
      ]);
      var amount = parseInt(params.paidAmount);
      if (amount >= 25000) { sendAlert('VENDOR', params, amount); }
    }

    else if (type === 'sale') {
      var sheet = ss.getSheetByName(SHEETS.sales);
      sheet.appendRow([
        params.ref, params.timestamp, params.flatId,
        params.buyerName, params.buyerPhone, params.agreedAmount,
        params.receivedAmount, params.payDate, params.paymode,
        params.stage, params.notes, photoUrl, new Date().toISOString()
      ]);
      sendAlert('SALE', params, parseInt(params.receivedAmount));
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', ref: params.ref, photoUrl: photoUrl }))
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

  if (action === 'getExpenses') {
    return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.expenses)));
  }
  if (action === 'getVendors') {
    return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.vendors)));
  }
  if (action === 'getSales') {
    return jsonResponse(getSheetData(ss.getSheetByName(SHEETS.sales)));
  }
  if (action === 'getAll') {
    return jsonResponse({
      expenses: getSheetData(ss.getSheetByName(SHEETS.expenses)),
      vendors:  getSheetData(ss.getSheetByName(SHEETS.vendors)),
      sales:    getSheetData(ss.getSheetByName(SHEETS.sales)),
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
    headers.forEach(function(h, i) { obj[h.toLowerCase().replace(/\s/g,'')] = row[i]; });
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
  if (type === 'EXPENSE') {
    msg = '🔔 G3 Expense\n'
      + '₹' + amount.toLocaleString('en-IN') + '\n'
      + (params.category || '') + ' — ' + (params.vendor || '') + '\n'
      + 'By: ' + (params.submittedBy || '') + '\n'
      + 'Ref: ' + params.ref;
  } else if (type === 'VENDOR') {
    msg = '🧾 G3 Vendor Payment\n'
      + '₹' + amount.toLocaleString('en-IN') + '\n'
      + (params.vendorName || '') + '\n'
      + 'Invoice: ' + (params.invoiceNo || '') + '\n'
      + 'Ref: ' + params.ref;
  } else if (type === 'SALE') {
    msg = '🏠 G3 Sale Payment\n'
      + '₹' + amount.toLocaleString('en-IN') + '\n'
      + 'Flat: ' + (params.flatId || '') + '\n'
      + 'Buyer: ' + (params.buyerName || '') + '\n'
      + 'Stage: ' + (params.stage || '') + '\n'
      + 'Ref: ' + params.ref;
  }
  var url = 'https://api.callmebot.com/whatsapp.php?'
    + 'phone=' + PHONE
    + '&text=' + encodeURIComponent(msg)
    + '&apikey=' + API_KEY;
  try { UrlFetchApp.fetch(url); } catch(e) {}
}

function weeklySummary() {
  setupSheets();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var expenses = getSheetData(ss.getSheetByName(SHEETS.expenses));
  var sales = getSheetData(ss.getSheetByName(SHEETS.sales));
  var now = new Date();
  var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  var weekExpenses = expenses.filter(function(e) { return new Date(e.timestamp) >= weekAgo; });
  var weekSales = sales.filter(function(s) { return new Date(s.timestamp) >= weekAgo; });
  var totalExp = weekExpenses.reduce(function(s, e) { return s + (parseFloat(e.amount) || 0); }, 0);
  var totalSal = weekSales.reduce(function(s, e) { return s + (parseFloat(e.receivedamount) || 0); }, 0);
  var msg = '📊 G3 Weekly Summary\n'
    + 'Week ending ' + now.toLocaleDateString('en-IN') + '\n\n'
    + 'Expenses: ₹' + Math.round(totalExp).toLocaleString('en-IN') + ' (' + weekExpenses.length + ' entries)\n'
    + 'Sales collected: ₹' + Math.round(totalSal).toLocaleString('en-IN') + ' (' + weekSales.length + ' entries)\n'
    + 'Net: ₹' + Math.round(totalSal - totalExp).toLocaleString('en-IN');
  var url = 'https://api.callmebot.com/whatsapp.php?'
    + 'phone=' + PHONE
    + '&text=' + encodeURIComponent(msg)
    + '&apikey=' + API_KEY;
  try { UrlFetchApp.fetch(url); } catch(e) {}
}
