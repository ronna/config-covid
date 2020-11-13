const moment = require('moment');
const today = moment().startOf('day');

const dateFrom = function(date, slice) {
  return moment().diff(date, slice);
};

const isReportValid = function (report) {
  if (report.form && report.fields && report.reported_date) { return true; }
  return false;
};

const getField = (report, fieldPath) => ['fields', ...(fieldPath || '').split('.')]
  .reduce((prev, fieldName) => {
    if (prev === undefined) { return undefined; }
    return prev[fieldName];
  }, report);

function getFormArraySubmittedInWindow(allReports, formArray, start, end) {
  return allReports.filter(function (report) {
    return formArray.includes(report.form) &&
      report.reported_date >= start && report.reported_date <= end;
  });
}

function getNewestReport(allReports, forms) {
  let result;
  allReports.forEach(function (report) {
    if (!isReportValid(report) || !forms.includes(report.form)) { return; }
    if (!result || report.reported_date > result.reported_date) {
      result = report;
    }
  });
  return result;
}

function isAlive(thisContact) {
  return thisContact && !thisContact.date_of_death;
}

module.exports = {
  dateFrom,
  getField,
  getFormArraySubmittedInWindow,
  getNewestReport,
  isAlive,
  today,
};
