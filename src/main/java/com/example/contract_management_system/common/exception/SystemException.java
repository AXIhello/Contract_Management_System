package com.example.contract_management_system.common.exception;

/**
 * 系统异常（不向用户展示细节的底层异常）
 */
public class SystemException extends RuntimeException {
    // 无参构造
    public SystemException() {
        super();
    }

    // 带消息构造
    public SystemException(String message) {
        super(message);
    }

    // 带异常原因构造（关键修改）
    public SystemException(String message, Throwable cause) {  // 使用Throwable而不是Exception
        super(message, cause);
    }

    // 仅带异常原因构造
    public SystemException(Throwable cause) {
        super(cause);
    }
}