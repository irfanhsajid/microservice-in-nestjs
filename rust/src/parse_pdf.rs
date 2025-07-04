use crate::carvu::{self, DetailedHistory, Recall, ServiceDetails, ServiceRecord};
use carvu::{Incident};

pub fn extract_section<'a>(text: &'a str, start_marker: &str, end_marker: &str) -> Option<&'a str> {
    let start_index = text.find(start_marker)?;
    let end_index = text[start_index..].find(end_marker)? + start_index;

    Some(&text[start_index..end_index])
}

pub fn extract_basic_fields(text: &str) -> (String, String, String, String, bool, String) {
    let mut vin = "N/A".to_string();
    let mut model = "N/A".to_string();
    let mut odometer = "N/A".to_string();
    let mut country = "N/A".to_string();
    let is_stolen = !text.contains("This vehicle is not actively declared stolen.");

    for line in text.lines().map(str::trim) {
        if vin == "N/A" {
            let compact = line.replace(char::is_whitespace, "");
            if compact.len() == 17 && compact.chars().all(|c| c.is_ascii_alphanumeric()) {
                vin = compact;
            }
        } else if model == "N/A" && line.len() >= 6 && line.chars().take(4).all(|c| c.is_ascii_digit()) {
            model = line.to_string();
        } else if odometer == "N/A" && line.contains("Last Reported Odometer:") {
            if let Some(value) = line.split("Last Reported Odometer:").nth(1) {
                odometer = value.trim().to_string();
            }
        } else if country == "N/A" && line.contains("Country of Assembly:") {
            if let Some(value) = line.split("Country of Assembly:").nth(1) {
                country = value.trim().to_string();
            }
        }

        if vin != "N/A" && model != "N/A" && odometer != "N/A" && country != "N/A" {
            break;
        }
    }

    let mut registration = "";
    if let Some(reg) = extract_section(&text, "This vehicle has been registered", "DATE ODOMETER SOURCE DETAILS") {
        registration = reg;
    }


    (vin, model, odometer, country, is_stolen, registration.to_string())
}


pub fn parse_incidents(text: &str) -> Vec<Incident> {
  let mut incidents = Vec::new();
    let mut current_incident: Option<Incident> = None;

    if let Some(accident_section) = extract_section(text, "INCIDENT DATE DETAILS AMOUNT", "This vehicle has been registered") {
        for line in accident_section.lines().map(str::trim).filter(|l| !l.is_empty() && !l.starts_with('')) {

            if line.starts_with("") {
                if let Some(incident) = current_incident.take() {
                    incidents.push(incident);
                }

                let line = line.trim_start_matches("").trim();
                let mut parts = line.splitn(4, ' ');
                let year = parts.next().unwrap_or("");
                let month = parts.next().unwrap_or("");
                let day = parts.next().unwrap_or("");
                let location = parts.collect::<Vec<&str>>().join(" ");

                current_incident = Some(Incident {
                    date: format!("{} {} {}", year, month, day),
                    location: location.trim().to_string(),
                    amount: Vec::new(),
                    details: Vec::new(),
                });
            } else if let Some(ci) = current_incident.as_mut() {
                if let Some(dollar_pos) = line.rfind('$') {
                    let (before, after) = line.split_at(dollar_pos);
                    ci.details.push(before.trim().to_string());
                    ci.amount.push(after.trim().to_string());
                } else {
                    ci.details.push(line.to_string());
                }
            }
        }
    }

    if let Some(incident) = current_incident {
        incidents.push(incident);
    }

    incidents
}


pub fn parse_service_records(text: &str) -> Vec<ServiceRecord> {
    let mut records = Vec::new();

    if let Some(service_records) = extract_section(
        text,
        "DATE ODOMETER SOURCE DETAILS",
        "DATE ODOMETER SOURCE RECORD TYPE DETAILS",
    ) {
        let mut lines = service_records.lines().map(str::trim).filter(|l| !l.is_empty()).peekable();

        while let Some(line) = lines.next() {
            // Match date lines like "2015 Jun 9" or fix malformed ones like "2021 No v 30"
            let  tokens: Vec<&str> = line.split_whitespace().collect();
            if tokens.len() >= 2 && tokens[0].chars().all(char::is_numeric) {
                let mut date;

                if tokens.len() >= 4 && tokens[1].len() == 2 && tokens[2].len() == 1 {
                    date = format!("{} {}{}", tokens[0], tokens[1], tokens[2]);
                    // Skip tokens[2] in date assembly
                    if tokens.len() > 3 {
                        date.push_str(&format!(" {}", tokens[3]));
                    }
                } else {
                    date = tokens[..3].join(" ");
                }

                let mut odometer = "N/A".to_string();
                let mut source = Vec::new();
                let mut details = None;

                let mut idx = 3;
                if tokens.len() > idx + 1 && tokens[idx + 1] == "KM" {
                    odometer = format!("{} KM", tokens[idx]);
                    idx += 2;
                }

                if idx < tokens.len() {
                    source.push(tokens[idx..].join(" "));
                }

                // Collect remaining lines as source until we hit "Vehicle serviced" or another date line
                while let Some(&next) = lines.peek() {
                    let next_tokens: Vec<&str> = next.split_whitespace().collect();
                    if next == "Vehicle serviced"
                        || (next_tokens.len() >= 2 && next_tokens[0].chars().all(char::is_numeric))
                    {
                        break;
                    }
                    source.push(lines.next().unwrap().to_string());
                }

                // Check for "Vehicle serviced" block
                if let Some(&next) = lines.peek() {
                    if next == "Vehicle serviced" {
                        lines.next(); // consume the line
                        let mut vehicle_serviced = Vec::new();
                        while let Some(&bullet_line) = lines.peek() {
                            if !bullet_line.starts_with('•') {
                                break;
                            }
                            vehicle_serviced.push(
                                lines
                                    .next()
                                    .unwrap()
                                    .trim_start_matches('•')
                                    .trim()
                                    .to_string(),
                            );
                        }

                        details = Some(ServiceDetails {
                            vehicle_serviced,
                        });
                    }
                }

                records.push(ServiceRecord {
                    date,
                    odometer,
                    source,
                    details,
                });
            }
        }
    } else {
        println!("no service records");
    }

    records
}


pub fn parse_detailed_history(text: &str) -> Vec<DetailedHistory> {
    let known_types = [
        "Service Record", "Canadian Renewal", "Repair Record",
        "Estimate Repair", "Collision", "Registration",
        "Insurance Records", "Motor Vehicle Dept.", "Estimate",
    ];

    let mut history = Vec::new();

    if let Some(detailed_history) = extract_section(
        text,
        "DATE ODOMETER SOURCE RECORD TYPE DETAILS",
        "Questions? We're here to help."
    ) {
        let mut lines = detailed_history.lines().map(str::trim).filter(|l| !l.is_empty()).peekable();

        while let Some(line) = lines.next() {
            let mut tokens: Vec<String> = line.split_whitespace().map(|s| s.to_string()).collect();

            if tokens.len() >= 2 && tokens[0].chars().all(char::is_numeric) {
                // Handle malformed dates like "No v" -> "Nov"
                if tokens.len() >= 4 && tokens[1].len() == 2 && tokens[2].len() == 1 {
                    tokens[1] = format!("{}{}", tokens[1], tokens[2]);
                    tokens.remove(2);
                }

                let date = tokens[..3.min(tokens.len())].join(" ");
                let mut odometer = "N/A".to_string();
                let mut source = Vec::new();

                let mut idx = 3;
                if tokens.len() > idx + 1 && tokens[idx + 1] == "KM" {
                    odometer = format!("{} KM", tokens[idx]);
                    idx += 2;
                }

                if idx < tokens.len() {
                    source.push(tokens[idx..].join(" "));
                }

                // Accumulate source lines until a known type appears
                while let Some(&next) = lines.peek() {
                    if known_types.iter().any(|t| next.starts_with(t)) {
                        break;
                    }
                    source.push(lines.next().unwrap().to_string());
                }

                // Match the record type and its details
                if let Some(type_line) = lines.next() {
                    if let Some(record_type) = known_types.iter().find(|&&t| type_line.starts_with(t)) {
                        let remainder = type_line[record_type.len()..].trim();
                        let mut string_details = vec![];

                        if !remainder.is_empty() {
                            string_details.push(remainder.to_string());
                        }

                        while let Some(&line) = lines.peek() {
                            if line.chars().next().map_or(false, |c| c.is_numeric()) {
                                break;
                            }
                            string_details.push(lines.next().unwrap().trim_start_matches('•').trim().to_string());
                        }

                        history.push(DetailedHistory {
                            date,
                            odometer,
                            source,
                            record_type: record_type.to_string(),
                            details: string_details,
                        });
                    }
                }
            }
        }
    }

    history
}


pub fn parse_recalls(text: &str) -> Vec<Recall> {
    let mut recalls = Vec::new();

    if let Some(section) = extract_section(
        text,
        "Recall #:",
        "This vehicle is not actively declared stolen.",
    ) {
        for line in section.lines().map(str::trim).filter(|l| !l.is_empty()) {
            if line.starts_with("Recall #:") && line.contains("Recall Date:") {
                let parts: Vec<&str> = line.split('|').collect();
                if parts.len() == 2 {
                    let recall_number = parts[0]
                        .trim_start_matches("Recall #:")
                        .trim()
                        .to_string();

                    let recall_date = parts[1]
                        .trim_start_matches("Recall Date:")
                        .trim()
                        .to_string();

                    recalls.push(Recall {
                        recall_number,
                        recall_date,
                    });
                }
            }
        }
    }

    recalls
}