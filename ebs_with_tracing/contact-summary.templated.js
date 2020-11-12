const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;


const getField = (report, fieldPath) => [...(fieldPath || '').split('.')]
    .reduce((prev, fieldName) => {
      if (prev === undefined) { return undefined; }
      return prev[fieldName];
    }, report);

const isPositive = () => { return getField(thisContact, 'role') === 'covid_patient'; };

const isReportValid = function (report) {
  if (report.form && report.fields && report.reported_date) { return true; }
  return false;
};

const hasReport = function (form) {
  return allReports && allReports.some((report) => report.form === form);
};

const context = {
  //isPassenger: isTraveler(),
  hasFormA0Form: hasReport('form_a0'),
  hasDeclarationForm: hasReport('declaration'),
  hasLocatorForm: hasReport('locator'),
  hasQuarantineForm: hasReport('quarantine'),
  hasHbcFollowupForm: hasReport('hbc_followup'),
};

const fields = [
  { appliesToType: 'person', label: 'patient_id', value: thisContact.patient_id, width: 4 },
  { appliesToType: 'person', label: 'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age' },
  { appliesToType: 'person', label: 'contact.sex', value: 'contact.sex.' + thisContact.sex, translate: true, width: 4 },
  { appliesToType: 'person', label: 'person.field.phone', value: thisContact.phone, width: 4 },
  { appliesToType: 'person', label: 'person.field.alternate_phone', value: thisContact.phone_alternate, width: 4 },
  { appliesToType: 'person', appliesIf: isPositive, label: 'days.since.symptoms.onset', value: thisContact.days_since_symptoms_onset, width: 4 },
  //{ appliesToType: 'person', appliesIf: isTraveler, label: 'contact.passport', value: getField(thisContact, 'traveler.passport'), width: 4 },
  { appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: '!person', label: 'contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: '!person', label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: '!person', label: 'External ID', value: thisContact.external_id, width: 4 },
  { appliesToType: '!person', appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: 'person', label: 'contact.notes', value: thisContact.notes, width: 12 },
  { appliesToType: '!person', label: 'contact.notes', value: thisContact.notes, width: 12 }
];

const cards = [
  {
    label: 'contact.profile.symptoms',
    appliesToType: 'person',
    appliesIf: function () {
      return isPositive() && !!getNewestReport(allReports, 'form_a0');
    },
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'form_a0');
            if (report) {
        fields.push(
            { label: 'contact.profile.symptoms.fever', value: 'contact.profile.symptoms.fever.' + getField(report, 'fields.patient_symptoms.fever'), translate: true, width: 6 },
		    { label: 'contact.profile.symptoms.temperature', value: 'contact.profile.symptoms.temperature.' + getField(report, 'fields.patient_symptoms.temperature'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.cough', value: 'contact.profile.symptoms.cough.' + getField(report, 'fields.patient_symptoms.cough'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.difficulty_breathing', value: 'contact.profile.symptoms.difficulty_breathing.' + getField(report, 'fields.patient_symptoms.difficulty_breathing'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.chest_pain', value: 'contact.profile.symptoms.chest_pain.' + getField(report, 'fields.patient_symptoms.difficulty_breathing'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.confusion', value: 'contact.profile.symptoms.confusion.' + getField(report, 'fields.patient_symptoms.confusion'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.body_aches', value: 'contact.profile.symptoms.body_aches.' + getField(report, 'fields.patient_symptoms.body_aches'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.sore_throat', value: 'contact.profile.symptoms.sore_throat.' + getField(report, 'fields.patient_symptoms.sore_throat'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.loss_tate', value: 'contact.profile.symptoms.loss_tate.' + getField(report, 'fields.patient_symptoms.loss_tate'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.diarrhea', value: 'contact.profile.symptoms.diarrhea.' + getField(report, 'fields.patient_symptoms.diarrhea'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.headache', value: 'contact.profile.symptoms.headache.' + getField(report, 'fields.patient_symptoms.headache'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.nausea', value: 'contact.profile.symptoms.nausea.' + getField(report, 'fields.patient_symptoms.nausea'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.conjunctivitis', value: 'contact.profile.symptoms.conjunctivitis.' + getField(report, 'fields.patient_symptoms.conjunctivitis'), translate: true, width: 6 }
        );
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.comorbidities',
    appliesToType: 'person',
    appliesIf: isPositive,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'form_a0');
      if (report) {
        fields.push(
            { label: 'contact.profile.quarantine.airline', value: getField(report, 'fields.flight_info.airline'), width: 4 },
            { label: 'contact.profile.quarantine.flight', value: getField(report, 'fields.flight_info.flight'), width: 4 },
            { label: 'contact.profile.quarantine.arrival_date', value: getField(report, 'fields.flight_info.arrival_date'), filter: 'simpleDate', width: 4 },
            { label: 'contact.profile.quarantine.accomodation.stay', value: 'contact.profile.quarantine.accomodation.stay.' + getField(report, 'fields.accomodation.staying_at'), translate: true, width: 4 },
            { label: 'contact.profile.quarantine.accomodation.province', value: getField(report, 'fields.accomodation.province'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.district', value: getField(report, 'fields.accomodation.district'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.municipality', value: getField(report, 'fields.accomodation.municipality'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.ward', value: getField(report, 'fields.accomodation.ward'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.house', value: getField(report, 'fields.accomodation.house'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.landline', value: getField(report, 'fields.accomodation.landline'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.mobile', value: getField(report, 'fields.accomodation.mobile'), width: 4 }
        );
      }
      else {
        fields.push({ label: 'contact.profile.comorbidities.none' });
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.declaration.form',
    appliesToType: 'person',
    appliesIf: isPositive,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'declaration');
      if (report) {
        const contactRiskFactors = getRiskFactors(getField(report, 'fields.contact_info'));
        const healthRiskFactors = getRiskFactors(getField(report, 'fields.health'));

        if (contactRiskFactors && contactRiskFactors.length > 0) {
          fields.push({ label: 'risk.contact.found', width: 12, icon: 'icon-risk' });
          contactRiskFactors.forEach(function (risk) {
            fields.push({ value: 'risk.contact.' + risk, translate: true, width: 12 });
          });
        }

        else {
          fields.push({ label: 'risk.contact.none' });
        }

        if (healthRiskFactors && healthRiskFactors.length > 0) {
          fields.push({ label: 'risk.health.found', width: 12, icon: 'icon-risk' });
          healthRiskFactors.forEach(function (risk) {
            fields.push({ value: 'risk.health.' + risk, translate: true, width: 12 });
          });
        }

        else {
          fields.push({ label: 'risk.health.none' });
        }

      }
      else {
        fields.push({ label: 'contact.profile.declaration.form.none' });
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.isolation',
    appliesToType: 'person',
    appliesIf: isPositive,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'form_a0');
      if (report) {
        fields.push(
            { label: 'contact.profile.isolation.date', value: getField(report, 'fields.isolation.isolation_date'), filter: 'simpleDate', width: 4 },
            { label: 'contact.profile.isolation.area', value: getField(report, 'fields.isolation.isolation_area'), width: 4 },

        );
      }
      else {
        fields.push({ label: 'contact.profile.isolation.none' });
      }

      return fields;
    }
  }

];

function getRiskFactors(group) {
  if (!group) return false;
  const riskFactors = [];
  Object.keys(group).forEach(function (key) {
    if (group[key] === 'true' && key.indexOf('_risk') < 0) {
      riskFactors.push(key);
    }
  });
  return riskFactors;
}

function getNewestReport(allReports, forms) {
  let result;
  allReports && allReports.forEach(function (report) {
    if (!isReportValid(report) || !forms.includes(report.form)) { return; }
    if (!result || report.reported_date > result.reported_date) {
      result = report;
    }
  });
  return result;
}


module.exports = {
  context: context,
  cards: cards,
  fields: fields
};
