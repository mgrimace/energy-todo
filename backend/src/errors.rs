use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("not found")]
    NotFound,
    #[error("invalid request")]
    BadRequest,
    #[error("payload too large")]
    PayloadTooLarge,
    #[error("persistence failure")]
    Persistence,
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::NotFound => StatusCode::NOT_FOUND,
            AppError::BadRequest => StatusCode::BAD_REQUEST,
            AppError::PayloadTooLarge => StatusCode::PAYLOAD_TOO_LARGE,
            AppError::Persistence => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(json!({ "error": self.to_string() }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::body::to_bytes;
    use serde_json::Value;

    #[actix_web::test]
    async fn not_found_error_is_json() {
        let response = AppError::NotFound.error_response();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);

        let body = to_bytes(response.into_body()).await.expect("body bytes");
        let payload: Value = serde_json::from_slice(&body).expect("valid json");
        assert_eq!(payload["error"], "not found");
    }

    #[actix_web::test]
    async fn payload_too_large_error_is_json() {
        let response = AppError::PayloadTooLarge.error_response();
        assert_eq!(response.status(), StatusCode::PAYLOAD_TOO_LARGE);

        let body = to_bytes(response.into_body()).await.expect("body bytes");
        let payload: Value = serde_json::from_slice(&body).expect("valid json");
        assert_eq!(payload["error"], "payload too large");
    }
}
