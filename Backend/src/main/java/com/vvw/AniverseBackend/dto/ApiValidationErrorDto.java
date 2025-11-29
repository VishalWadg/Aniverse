package com.vvw.AniverseBackend.dto;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
public class ApiValidationErrorDto extends ApiErrorDto{
    private Map<String, String> validationErrors;

    public ApiValidationErrorDto(int status, String message, String path, Map<String, String> validationErrors){
        super(status, "Validation Error", message, path);
        this.validationErrors = validationErrors;
    }
}
