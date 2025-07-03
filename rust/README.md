# Run this service

This server will run on loopback address [::1]:50051

How to start:

First you need to have `src/grpc/proto/pdf-service/pdf-service.proto` file

Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```
Next add vendor
```bash
cargo vendor vendor
```
Build service
```bash
cargo build --release
```

Start run it inside `<root>rust/` dir
```bash
./target/release/server
```
