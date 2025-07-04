use carvu::pdf_service_server::{PdfServiceServer, PdfService};
use carvu::{RequestPdfParsingPayload, ResponsePdfParsingPayload, CarfaxData};
use pdf_extract::extract_text_from_mem;
use reqwest::Client;
use tonic::transport::Server;
use tonic::{Request, Response, Status};
use parse_pdf::{extract_basic_fields, parse_incidents};

use crate::parse_pdf::{parse_detailed_history, parse_recalls, parse_service_records};

pub mod parse_pdf;

pub mod carvu {
    tonic::include_proto!("carvu");
}

#[derive(Debug, Default)]
pub struct PDFService {}

#[tonic::async_trait]
impl PdfService for PDFService {
  async fn request_pdf_parsing(
        &self,
        request: Request<RequestPdfParsingPayload>,
    ) -> Result<Response<ResponsePdfParsingPayload>, Status> {
        let payload = request.into_inner();
        let url = payload.url;
        println!("got url {:?}", url);

        let client = Client::new();

        // Download pdf bytes
        let reponse = client.get(url).send().await.map_err(|e| {
            Status::internal(format!("Falied to process PDF: {}", e))
        })?;

        if !reponse.status().is_success() {
            return Err(Status::internal(format!("Failed to process PDF, status: {}", reponse.status())));
        }

        let pdf_bytes = reponse.bytes().await.map_err(|e| {
            Status::internal(format!("Falied to read PDF response body: {}", e))
        })?;

        // println!("Extracted Text:\n{}", full_text);
        let text = extract_text_from_mem(&pdf_bytes).map_err(|e| {
            Status::internal(format!("Failed to extract text from PDF: {}", e))
        })?;
        println!("{}", text);
        // println!("Full extracted text:\n{}", text);
        let basic_field = extract_basic_fields(&text);

        let incident = parse_incidents(&text);

        let service_records = parse_service_records(&text);

        let detailed_history = parse_detailed_history(&text);

        let recall = parse_recalls(&text);


        println!("basic text {} {} {} {} {}", basic_field.0, basic_field.1, basic_field.2, basic_field.3, basic_field.4);

        // Dummy CarfaxData
        let carfax_data = CarfaxData {
            vin: basic_field.0,
            model: basic_field.1,
            odometer: basic_field.2,
            country: basic_field.3,
            is_stolen: basic_field.4,
            accidents: incident,
            registration: "This vehicle has been registered in the province of Ontario in Canada with Normal branding".to_string(),
            service_records: service_records,
            detailed_history: detailed_history,
            recalls: recall,
        };

        Ok(Response::new(ResponsePdfParsingPayload {
            status: true,
            errors: "".to_string(),
            data: Some(carfax_data),
        }))
    }
}

#[tokio::main]
async  fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr =  "[::1]:50051".parse()?;
    let pdf_service = PDFService::default();

    println!("PDF parsing server running on {}", addr);

    Server::builder()
    .add_service(PdfServiceServer::new(pdf_service)).serve(addr).await?;

    Ok(())
}
