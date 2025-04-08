package com.boot.demo.Exception;

public class InvalidReportDataException extends RuntimeException {
    public InvalidReportDataException(String message) {
        super(message);
    }
}
