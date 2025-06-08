 package com.example.contract_management_system.util;

 import com.fasterxml.jackson.annotation.JsonProperty;
 import lombok.Getter;
 import lombok.Setter;

 public class Result<T> {
     // Getter 和 Setter
     @Setter
     @Getter
     private int code;      // 状态码
     @Setter
     @Getter
    private String msg;    // 提示信息
     @Setter
     @Getter
    private T data;        // 泛型数据
    @JsonProperty("success") // 让序列化字段名为 success
    private boolean success;
    // 构造函数
    private Result(int code, String msg, T data, boolean success) {
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.success = success; // 自动赋值成功标志
    }

    // 快捷构建方法
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data, true);
    }

    public static <T> Result<T> success() {
        return new Result<>(200, "操作成功", null, true);
    }

    public static <T> Result<T> error(String msg) {
        return new Result<>(500, msg, null, false);
    }

    public static <T> Result<T> error(int code, String msg) {
        return new Result<>(code, msg, null, false);
    }
}