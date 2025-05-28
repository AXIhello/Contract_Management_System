package com.example.contract_management_system.common.exception;

import lombok.Getter;

/**
 * 业务异常（通常需要向用户展示友好错误信息）
 */
@Getter
public class BusinessException extends RuntimeException {
    // 获取错误码（可用于前端区分错误类型）
    // 可添加错误码字段
    private final String errorCode;

    public BusinessException(String message) {
        super(message);
        this.errorCode = "DEFAULT_ERROR";
    }

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

}
