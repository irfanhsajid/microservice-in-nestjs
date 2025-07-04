use std::path::Path;
use tokio::fs;

use carvu::pdf_service_server::{PdfServiceServer, PdfService};
use carvu::{RequestPdfParsingPayload, ResponsePdfParsingPayload, CarfaxData};
use pdf_extract::{extract_text_from_mem};
use tokio::io::AsyncReadExt;
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

        let pdf_bytes = if payload.local {
            println!("using local file");
            let path = Path::new("..").join(&url);
            let mut file = fs::File::open(&path).await.map_err(|e| {
            Status::internal(format!("Failed to open local PDF file: {}", e))})?;

            let mut buf = Vec::new();
            file.read_to_end(&mut buf).await.map_err(|e| {
                Status::internal(format!("Failed to read local PDF file: {}", e))
            })?;

            // Delete the local file after reading
            fs::remove_file(path).await.map_err(|e| {
                Status::internal(format!("Failed to delete local PDF file: {}", e))
            })?;

            buf
        } else {
            // Download from URL
            println!("using online file");
            let client = reqwest::Client::new();
            let res = client.get(&url).send().await.map_err(|e| {
                Status::internal(format!("Failed to fetch remote PDF: {}", e))
            })?;

            res.bytes().await.map_err(|e| {
                Status::internal(format!("Failed to read remote PDF content: {}", e))
            })?.to_vec()

        };

        // println!("Extracted Text:\n{}", full_text);
        let text = extract_text_from_mem(&pdf_bytes).map_err(|e| {
            Status::internal(format!("Failed to extract text from PDF: {}", e))
        })?;

        let basic_field = extract_basic_fields(&text);

        let incident = parse_incidents(&text);

        let service_records = parse_service_records(&text);

        let detailed_history = parse_detailed_history(&text);

        let recall = parse_recalls(&text);

        println!("PDF processing done!");
        // Dummy CarfaxData
        let carfax_data = CarfaxData {
            vin: basic_field.0,
            model: basic_field.1,
            odometer: basic_field.2,
            country: basic_field.3,
            is_stolen: basic_field.4,
            registration: basic_field.5,
            accidents: incident,
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
