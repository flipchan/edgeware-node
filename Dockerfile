FROM rust:buster as builder
LABEL description="3.5.1 docker test"


WORKDIR /edgeware

RUN rustup default nightly-2022-06-02 && \
	rustup target add wasm32-unknown-unknown --toolchain nightly-2022-06-02


COPY . .

RUN apt-get update && \
	apt-get install -y cmake pkg-config libssl-dev git clang libclang-dev

RUN cargo build --release 


RUN useradd -m -u 1000 -U -s /bin/sh -d /edgeware edgeware

COPY /edgeware/target/release/edgeware /usr/local/bin


USER edgeware
EXPOSE 30333 9933 9944

RUN mkdir /edgeware/data

VOLUME ["/edgeware/data"]

ENTRYPOINT ["/usr/local/bin/edgeware"]

