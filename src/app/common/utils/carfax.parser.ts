import * as fs from 'fs';
import { writeFile } from 'fs/promises';
import * as pdf from 'pdf-parse';

interface Incident {
  date: string;
  location: string;
  amount: string[];
  details: string[];
}

interface ServiceRecord {
  date: string;
  odometer: string;
  source: string[];
  details: { 'Vehicle serviced': string[] | null };
}

interface DetailedHistory {
  date: string;
  odometer: string;
  source: string[];
  record_type: string;
  details: string[] | { 'Vehicle serviced': string[] | null };
}

export interface CarfaxData {
  vin: string;
  model: string;
  odometer: string;
  country: string;

  accidents: Incident[];

  service_records: ServiceRecord[];

  detailed_history: DetailedHistory[];

  registrations: Array<{
    date?: string | null;
    source?: string;
    record_type?: string;
  }>;

  recalls: Array<{
    recallNumber: string;
    recallDate: string;
  }>;

  isStolen: boolean;
}

export async function parseCarfaxPDF(filePath: string): Promise<CarfaxData> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  const text = data.text;

  const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/);
  const makeModelMatch = text.match(/\d{4} [A-Z ]{2,}/);
  const odometerMatch = text.match(/Last Reported Odometer:\s+([\d,]+ KM)/);
  const countryMatch = text.match(/Country of Assembly:\s+(.*)/);

  const isStolen = text.includes(
    'This vehicle is not actively declared stolen.',
  )
    ? false
    : true;

  // 🔹 Accident Section
  let accidents: CarfaxData['accidents'] = [];
  const accidentSectionMatch = text.match(
    /INCIDENT DATEDETAILSAMOUNT([\s\S]*?)This vehicle has been registered/,
  );
  if (accidentSectionMatch) {
    accidents = parseIncidentData(accidentSectionMatch[0]);
  }

  // 🔹 Service Records
  let service_records: CarfaxData['service_records'] = [];

  const serviceLines = text.match(
    /ODOMETERSOURCEDETAILS([\s\S]*?)DATEODOMETERSOURCERECORD TYPEDETAILS/,
  );
  if (serviceLines) {
    service_records = parseServiceRecords(serviceLines[0]);
  }

  // Detailed History
  let detailed_history: CarfaxData['detailed_history'] = [];

  const detailedHistory = text.match(
    /Detailed History([\s\S]*?)This vehicle history report is compiled/,
  );

  if (detailedHistory) {
    detailed_history = parseVehicleHistory(detailedHistory[0]);
  }
  // 🔹 Registrations
  const registrationMatches = [
    ...text.matchAll(
      /(\d{4} [A-Za-z]+ \d{1,2})[\s\S]*?Motor Vehicle Dept\.\s+(.*?)\s+(Canadian Renewal.*?)\n/g,
    ),
  ];
  const registrations = registrationMatches.map((m) => ({
    date: m[1],
    source: m[2].trim(),
    info: m[3].trim(),
  }));

  // 🔹 Recalls
  const recalls: CarfaxData['recalls'] = [];
  const recallMatches = [
    ...text.matchAll(
      /Recall #:\s+(\w+)\s*\|Recall Date:\s*(\d{4} [A-Za-z]+ \d{2})/g,
    ),
  ];
  for (const m of recallMatches) {
    recalls.push({ recallNumber: m[1], recallDate: m[2] });
  }

  return {
    vin: vinMatch?.[0] || 'N/A',
    model: makeModelMatch?.[0]?.trim() || 'N/A',
    odometer: odometerMatch?.[1] || 'N/A',
    country: countryMatch?.[1]?.trim() || 'N/A',
    accidents,
    service_records,
    detailed_history,
    registrations,
    recalls,
    isStolen,
  };
}

// void (async () => {
//   console.time('parseCarfaxPDF'); // Start timer

//   const result = await parseCarfaxPDF(
//     '/home/mrk/Desktop/project/carvu/CARFAX Canada Vehicle History Report 2.pdf',
//   );

//   await writeFile(
//     '/home/mrk/Desktop/project/carvu/output.json',
//     JSON.stringify(result, null, 2),
//     'utf-8',
//   );

//   console.timeEnd('parseCarfaxPDF'); // End timer and log result
//   console.log('Saved to output.json');
// })();

function parseIncidentData(text: string): Incident[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith('INCIDENT DATEDETAILSAMOUNT') &&
        !line.startsWith('') &&
        !line.includes('This vehicle has been registered'),
    );

  const incidents: Incident[] = [];
  let currentIncident: Incident | null = null;

  for (const line of lines) {
    const dateLocationMatch = line.match(/^(\d{4} [A-Za-z]{3} \d{1,2})(.*)$/);
    const amountMatch = line.match(/^\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/);

    if (dateLocationMatch) {
      // Save previous incident
      if (currentIncident) {
        incidents.push(currentIncident);
      }

      currentIncident = {
        date: dateLocationMatch[1].trim(),
        location: dateLocationMatch[2].trim(),
        amount: [],
        details: [],
      };
    } else if (amountMatch && currentIncident) {
      currentIncident.amount.push(line);
    } else if (currentIncident) {
      // Check for trailing amount in detail line
      const detailAmountMatch = line.match(/\$(\d{1,3}(?:,\d{3})*\.\d{2})$/);
      if (detailAmountMatch) {
        currentIncident.amount.push(`$${detailAmountMatch[1]}`);
        const detailWithoutAmount = line
          .replace(/\$\d{1,3}(?:,\d{3})*\.\d{2}$/, '')
          .trim();
        currentIncident.details.push(detailWithoutAmount);
      } else {
        currentIncident.details.push(line);
      }
    }
  }

  // Push last incident
  if (currentIncident) {
    incidents.push(currentIncident);
  }

  return incidents;
}

function parseServiceRecords(raw: string): ServiceRecord[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith('JA') &&
        !line.startsWith('https://') &&
        !line.includes('Vehicle History Report') &&
        !line.includes('Accident/Damage') &&
        !line.includes('Registration') &&
        !line.includes('Service Records') &&
        !line.includes('No safety recall'),
    );

  const result: ServiceRecord[] = [];
  let i = 0;

  while (i < lines.length) {
    let date = '';
    let odometer = 'N/A';
    const sourceLines: string[] = [];
    let serviced = false;
    const serviceDetails: string[] = [];

    // Match date + optional odometer
    const dateOdoMatch = lines[i].match(
      /^(\d{4} [A-Za-z]{3} \d{1,2})(?:\s+([\d,]+ KM))?(.*)?$/,
    );

    if (dateOdoMatch) {
      date = dateOdoMatch[1].trim();
      if (dateOdoMatch[2]) odometer = dateOdoMatch[2].trim();

      const inlineSource = dateOdoMatch[3]?.trim();
      i++;

      if (inlineSource) {
        sourceLines.push(inlineSource);
      }

      // Gather remaining source lines until we hit 'Vehicle serviced', bullet (•), or a new date line
      while (
        i < lines.length &&
        !lines[i].match(/^\d{4} [A-Za-z]{3} \d{1,2}/) &&
        lines[i] !== 'Vehicle serviced' &&
        !lines[i].startsWith('•')
      ) {
        sourceLines.push(lines[i++]);
      }

      // Check if it's a service record
      if (lines[i] === 'Vehicle serviced') {
        serviced = true;
        i++;
        while (i < lines.length && lines[i].startsWith('•')) {
          serviceDetails.push(lines[i++].replace(/^•/, '').trim());
        }
      }

      result.push({
        date,
        odometer,
        source: sourceLines,
        details: {
          'Vehicle serviced': serviced
            ? serviceDetails.length > 0
              ? serviceDetails
              : null
            : null,
        },
      });
    } else {
      i++;
    }
  }

  return result;
}

function parseVehicleHistory(raw: string): DetailedHistory[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith('JA') &&
        !line.startsWith('https://') &&
        !line.includes('Vehicle History Report') &&
        !line.includes('Open Recalls') &&
        !line.includes('Stolen Vehicle Check') &&
        !line.includes('Detailed History') &&
        !line.includes('No safety recall') &&
        !line.includes('Questions?') &&
        !line.includes('support.carfax.ca'),
    );

  const knownRecordTypes = [
    'Service Record',
    'Canadian Renewal',
    'Repair Record',
    'Estimate Repair',
    'Collision',
    'Registration',
    'Insurance Records',
    'Motor Vehicle Dept.',
    'Estimate',
  ];

  const result: DetailedHistory[] = [];
  let i = 0;

  while (i < lines.length) {
    let date = '';
    let odometer = 'N/A';
    let recordType = '';
    let details: string[] | { 'Vehicle serviced': string[] | null } = [];
    const source: string[] = [];

    // Match line with date and optional odometer
    const dateOdoMatch = lines[i].match(
      /^(\d{4} [A-Za-z]{3} \d{1,2})(?:\s+([\d,]+ KM))?(.*)?$/,
    );
    if (!dateOdoMatch) {
      i++;
      continue;
    }

    date = dateOdoMatch[1];
    if (dateOdoMatch[2]) {
      odometer = dateOdoMatch[2];
    }
    const inline = dateOdoMatch[3]?.trim();
    if (inline) source.push(inline);
    i++;

    // Collect source lines until a record type is found
    while (
      i < lines.length &&
      !knownRecordTypes.some((rt) => lines[i].startsWith(rt))
    ) {
      source.push(lines[i++]);
    }

    // Extract record type
    if (
      i < lines.length &&
      knownRecordTypes.some((rt) => lines[i].startsWith(rt))
    ) {
      recordType = knownRecordTypes.find((rt) => lines[i].startsWith(rt))!;
      const remainder = lines[i].slice(recordType.length).trim();
      i++;

      // Handle service record specifically
      if (recordType === 'Service Record') {
        if (
          remainder === 'Vehicle serviced' ||
          lines[i] === 'Vehicle serviced'
        ) {
          if (remainder !== 'Vehicle serviced') i++; // skip next line
          const serviceDetails: string[] = [];
          while (i < lines.length && lines[i].startsWith('•')) {
            serviceDetails.push(lines[i++].replace(/^•/, '').trim());
          }
          details = {
            'Vehicle serviced': serviceDetails.length ? serviceDetails : null,
          };
        } else {
          details = { 'Vehicle serviced': null };
        }
      } else {
        // Generic record type with extra detail lines
        const otherDetails: string[] = [];
        if (remainder) otherDetails.push(remainder);
        while (
          i < lines.length &&
          !/^\d{4} [A-Za-z]{3} \d{1,2}/.test(lines[i])
        ) {
          otherDetails.push(lines[i++]);
        }
        details = otherDetails;
      }

      result.push({
        date,
        odometer,
        source,
        record_type: recordType,
        details,
      });
    }
  }

  return result;
}
