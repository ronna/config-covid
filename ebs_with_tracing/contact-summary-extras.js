const moment = require('moment');
const today = moment().startOf('day');

const isReportValid = function (report) {
  if (report.form && report.fields && report.reported_date) { return true; }
  return false;
};

const hbcForms = ['form_a0', 'hbc_followup', 'general_followup'];

const outcomeForms = ['outcome'];

const dangerSignForms = ['form_a0', 'hbc_followup', 'general_followup'];


const MAX_DAYS_IN_ISOLATION = 21 + 4;
const AVG_DAYS_IN_ISOLATION = 40;

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

function getDischargeDate(report) {
  return isOutcomeForm(report) && getField(report, 'outcome_details.date_of_outcome_submission') && moment(getField(report, 'outcome_details.date_of_outcome_submission'));
}

function getNextCovidFollowupDate(allReports, report) {
  let nextVisit = getField(report, 'next_visit');
  let eddReportDate = report.reported_date;
  const followUps = getSubsequentFollowUps(allReports, report);
  followUps.forEach(function (followUpReport) {
    if (followUpReport.reported_date > eddReportDate && !!getField(followUpReport, 'next_visit')) {
      eddReportDate = followUpReport.reported_date;
      nextVisit = getField(followUpReport, 'next_visit');
    }
  });
  return moment(nextVisit);
}

function getDangerSignCodes(report) {
  const dangerSignCodes = [];
  if (getField(report, 'symptom_existence') === 'yes') {
    const dangerSignsObj = getField(report, 'danger_signs');
    if (dangerSignsObj) {
      for (const dangerSign in dangerSignsObj) {
        if (dangerSignsObj[dangerSign] === 'yes' && dangerSign !== 'r_refer_danger_sign') {
          dangerSignCodes.push(dangerSign);
        }
      }
    }
  }
  return dangerSignCodes;
}

/***
function getLatestDangerSignsForPregnancy(allReports, pregnancy) {
  if (!pregnancy) { return []; }
  let lmpDate = getMostRecentLMPDateForPregnancy(allReports, pregnancy);
  if (!lmpDate) { lmpDate = moment(pregnancy.reported_date); } //If unknown, take preganacy.reported_date
  const allReportsWithDangerSigns = getFormArraySubmittedInWindow(allReports, pregnancDangerSignForms, lmpDate.toDate(), lmpDate.clone().add(MAX_DAYS_IN_PREGNANCY, 'days').toDate());
  const allRelevantReports = [];
  allReportsWithDangerSigns.forEach((report) => {
    if (isPregnancyFollowUpForm(report)) {
      //only push pregnancy home visit report that have actually been visited
      if (getField(report, 'pregnancy_summary.visit_option') === 'yes') {
        allRelevantReports.push(report);
      }
    }
    //for other reports with danger signs, push without checking for visit
    else {
      allRelevantReports.push(report);
    }
  });
  const recentReport = getNewestReport(allRelevantReports, pregnancDangerSignForms);
  if (!recentReport) { return []; }
  return getDangerSignCodes(recentReport);
}
***/

/***
function getRiskFactorsFromPregnancy(report) {
  const riskFactors = [];
  if (!isPregnancyForm(report)) { return []; }
  if (getField(report, 'risk_factors.r_risk_factor_present') === 'yes') {
    if (getField(report, 'risk_factors.risk_factors_history.first_pregnancy') === 'yes') {
      riskFactors.push('first_pregnancy');
    }
    if (getField(report, 'risk_factors.risk_factors_history.previous_miscarriage') === 'yes') {
      riskFactors.push('previous_miscarriage');
    }
    const riskFactorsPrimary = getField(report, 'risk_factors.risk_factors_present.primary_condition');
    const riskFactorsSecondary = getField(report, 'risk_factors.risk_factors_present.secondary_condition');
    if (riskFactorsPrimary) {
      riskFactors.push(...riskFactorsPrimary.split(' '));
    }
    else if (riskFactorsSecondary) {
      riskFactors.push(...riskFactorsSecondary.split(' '));
    }
  }
  return riskFactors;
}

function getNewRiskFactorsFromFollowUps(report) {
  const riskFactors = [];
  if (!isPregnancyFollowUpForm(report)) { return []; }
  if (getField(report, 'anc_visits_hf.risk_factors.r_risk_factor_present') === 'yes') {
    const newRiskFactors = getField(report, 'anc_visits_hf.risk_factors.new_risks');
    if (newRiskFactors) {
      riskFactors.push(...newRiskFactors.split(' '));
    }
  }
  return riskFactors;
}

function getAllRiskFactors(allReports, pregnancy) {
  const riskFactorCodes = getRiskFactorsFromPregnancy(pregnancy);
  const pregnancyFollowUps = getSubsequentPregnancyFollowUps(allReports, pregnancy);
  pregnancyFollowUps.forEach(function (visit) {
    riskFactorCodes.push(...getNewRiskFactorsFromFollowUps(visit));
  });
  return riskFactorCodes;
}

function getRiskFactorExtra(report) {
  let extraRisk;
  if (report && isPregnancyForm(report)) {
    extraRisk = getField(report, 'risk_factors.risk_factors_present.additional_risk');
  }
  else if (report && isPregnancyFollowUpForm(report)) {
    extraRisk = getField(report, 'anc_visits_hf.risk_factors.additional_risk');
  }
  return extraRisk;
}

function getAllRiskFactorExtra(allReports, pregnancy) {
  const riskFactorsExtra = [];
  const riskFactorExtraFromPregnancy = getRiskFactorExtra(pregnancy);
  if (riskFactorExtraFromPregnancy) {
    riskFactorsExtra.push(riskFactorExtraFromPregnancy);
  }
  const pregnancyFollowUps = getSubsequentPregnancyFollowUps(allReports, pregnancy);
  pregnancyFollowUps.forEach(function (visit) {
    const riskFactorExtraFromVisit = getRiskFactorExtra(visit);
    if (riskFactorExtraFromVisit) {
      riskFactorsExtra.push(riskFactorExtraFromVisit);
    }
  });
  return riskFactorsExtra;
}

const isHighRiskPregnancy = function (allReports, pregnancy) {
  return getAllRiskFactors(allReports, pregnancy).length ||
    getAllRiskFactorExtra(allReports, pregnancy).length ||
    getDangerSignCodes(pregnancy).length;
};
***/
function isAlive(thisContact) {
  return thisContact && !thisContact.date_of_death;
}

function isHomeBasedCareForm(report) {
  return report && hbcForms.includes(report.form);
}

function isHomeBasedCareFollowUpForm(report) {
  return report && hbcForms.includes(report.form);
}

function isOutcomeForm(report) {
  return report && outcomeForms.includes(report.form);
}


function isActiveCovid(thisContact, allReports, report) {
  if (thisContact.type !== 'person' || !isAlive(thisContact) || !isHomeBasedCareForm(report)) { return false; }
/***
  const lmpDate = getMostRecentLMPDateForPregnancy(allReports, report) || report.reported_date;
  const isPregnancyRegisteredWithin9Months = lmpDate > today.clone().subtract(MAX_DAYS_IN_PREGNANCY, 'day');
  const isPregnancyTerminatedByDeliveryInLast6Weeks = getSubsequentDeliveries(allReports, report, 6 * 7).length > 0;
  const isPregnancyTerminatedByAnotherPregnancyReport = getSubsequentPregnancies(allReports, report).length > 0;
  return isPregnancyRegisteredWithin9Months &&
    !isPregnancyTerminatedByDeliveryInLast6Weeks &&
    !isPregnancyTerminatedByAnotherPregnancyReport &&
    !getRecentANCVisitWithEvent(allReports, report, 'abortion') &&
    !getRecentANCVisitWithEvent(allReports, report, 'miscarriage');
    ***/
}

/***
function isReadyForDelivery(thisContact, allReports) {
  //If pregnancy registration, date of LMP should be at least 6 months ago and no more than EDD + 6 weeks.
  //If pregnancy registration and no LMP, make it available at registration and until 280 days + 6 weeks from the date of registration.
  //If no pregnancy registration, previous delivery date should be at least 7 months ago.
  if (thisContact.type !== 'person') { return false; }
  const latestPregnancy = getNewestReport(allReports, pregnancyForms);
  const latestDelivery = getNewestReport(allReports, deliveryForms);
  if (!latestPregnancy && !latestDelivery) {
    //no previous pregnancy, no previous delivery
    return true;
  }
  else if (latestDelivery && (!latestPregnancy || latestDelivery.reported_date > latestPregnancy.reported_date)) {
    //no pregnancy registration, previous delivery date should be at least 7 months ago.
    return getDeliveryDate(latestDelivery) < today.clone().subtract(7, 'months');
  }

  else if (latestPregnancy) {
    if (isPregnancyForm(latestPregnancy)) {
      const lmpDate = getMostRecentLMPDateForPregnancy(allReports, latestPregnancy);
      if (!lmpDate) {//no LMP, show until 280 days + 6 weeks from the date of registration
        return moment(latestPregnancy.reported_date).clone().startOf('day').add(280 + 6 * 7, 'days').isSameOrBefore(today);
      }
      else {//Pregnancy registration with LMP
        const edd = getMostRecentEDDForPregnancy(allReports, latestPregnancy);
        //at least 6 months ago, no more than EDD + 6 weeks
        return today.isBetween(lmpDate.clone().add(6, 'months'), edd.clone().add(6, 'weeks'));
      }
    }
  }
  return false;
}
***/

/***
function getRecentANCVisitWithEvent(allReports, pregnancyReport, event) {
  //event can be one of miscarriage, abortion, refused, migrated
  const followUps = getSubsequentPregnancyFollowUps(allReports, pregnancyReport);
  const latestFollowup = getNewestReport(followUps, antenatalForms);
  if (latestFollowup && getField(latestFollowup, 'pregnancy_summary.visit_option') === event) {
    return latestFollowup;
  }
}

function getSubsequentDeliveries(allReports, pregnancyReport, withinLastXDays) {
  return allReports.filter(function (report) {
    return (isDeliveryForm(report)) &&
      report.reported_date > pregnancyReport.reported_date &&
      (!withinLastXDays || report.reported_date >= (today.clone().subtract(withinLastXDays, 'days')));
  });
}

function getSubsequentPregnancyFollowUps(allReports, pregnancyReport) {
  let lmpDate = getLMPDateFromPregnancy(pregnancyReport);
  if (!lmpDate) { //LMP Date is not available, use reported date
    lmpDate = moment(pregnancyReport.reported_date);
  }
  const subsequentVisits = allReports.filter(function (visitReport) {
    return isPregnancyFollowUpForm(visitReport) &&
      visitReport.reported_date > pregnancyReport.reported_date &&
      moment(visitReport.reported_date) < lmpDate.clone().add(MAX_DAYS_IN_PREGNANCY, 'days');
  });
  return subsequentVisits;
}
***/

/***
function countANCFacilityVisits(allReports, hbcReport) {
  let ancHFVisits = 0;
  const pregnancyFollowUps = getSubsequentFollowUps(allReports, hbcReport);
  if (getField(pregnancyReport, 'anc_visits_hf.anc_visits_hf_past') && !isNaN(getField(pregnancyReport, 'anc_visits_hf.anc_visits_hf_past.visited_hf_count'))) {
    ancHFVisits += parseInt(getField(pregnancyReport, 'anc_visits_hf.anc_visits_hf_past.visited_hf_count'));
  }
  ancHFVisits += pregnancyFollowUps.reduce(function (sum, report) {
    const pastANCHFVisits = getField(report, 'anc_visits_hf.anc_visits_hf_past');
    if (!pastANCHFVisits) { return 0; }
    sum += pastANCHFVisits.last_visit_attended === 'yes' && 1;
    if (isNaN(pastANCHFVisits.visited_hf_count)) { return sum; }
    return sum += pastANCHFVisits.report_other_visits === 'yes' && parseInt(pastANCHFVisits.visited_hf_count);
  },
  0);
  return ancHFVisits;
}

function knowsHIVStatusInPast3Months(allReports) {
  let knows = false;
  const pregnancyFormsIn3Months = getFormArraySubmittedInWindow(allReports, pregnancyForms, today.clone().subtract(3, 'months'), today);
  pregnancyFormsIn3Months.forEach(function (report) {
    if (getField(report, 'pregnancy_new_or_current.hiv_status.hiv_status_know') === 'yes') {
      knows = true;
    }
  });
  return knows;
}
***/

module.exports = {
  today,
  isHighRiskPatient,
  getNewestReport,
  isAlive,
  isActiveCovid,
  countCovidFollowups,
  getAllRiskFactors,
  getAllRiskFactorExtra,
  getNextCovidFollowupDate,
  isReadyForDischarge,
  getMostRecentEDD,
  getDischargeDate,
  getSymptonsOnSetDate,
  dangerSigns,
  getField
};
