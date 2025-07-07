use tonic_build;

fn main() -> Result<(), std::io::Error> {
    tonic_build::compile_protos("../src/grpc/proto/carvu_proto/pdf-service/pdf-service.proto")?;
    // tonic_build::configure().build_server(true).compile_protos(&["../src/grpc/proto/carvu_proto/pdf-service/pdf-service.proto"], &["../src/grpc/proto/carvu_proto"])?;
    Ok(())
}
